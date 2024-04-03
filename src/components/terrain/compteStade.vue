<template>
  <div class="container">
    <div class="images-container">
      <h2>Vos Images</h2>
      <div v-if="images.length === 0" class="no-images-message">Aucune image téléchargée.</div>
      <div v-else>
        <div class="image-item" v-for="(image, index) in images" :key="index">
          <img :src="image.url" alt="Uploaded Image">
          <button @click="deleteImage(image)" class="delete-button">Supprimer</button>
        </div>
      </div>
      <div>
        <h2>Ajouter une nouvelle photo</h2>
        <input type="file" @change="selectNewImage">
        <button v-if="newImage" @click="uploadNewImage">Enregistrer Nouvelle Image</button>
      </div>
    </div>
    <div class="user-info-container">
      <h2>Informations Utilisateur</h2>
      <form @submit.prevent="modifierInformations">
        <div class="user-info">
          <label for="nom">Nom:</label>
          <input type="text" id="nom" v-model="userInfo.name"><br>
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="userInfo.email" disabled><br>
          <label for="adresse">Adresse:</label>
          <input type="text" id="adresse" v-model="userInfo.address"><br>
          <label for="description">Description:</label>
          <input type="text" id="description" v-model="userInfo.description"><br>
          <label for="stadiumName">Nom du Stade:</label>
          <input type="text" id="stadiumName" v-model="userInfo.stadiumName"><br>
          <label for="reservationPrice">Prix de réservation:</label>
          <input type="text" id="reservationPrice" v-model="userInfo.reservationPrice"><br>
          <button type="submit">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { db,storage,auth } from "../../firebase/firebase";
import { ref, listAll, getDownloadURL, deleteObject, uploadBytes } from "firebase/storage";
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2'


export default {
  name: "imageApp",
  data() {
    return {
      images: [],
      email:'',
      userInfo: {},
      newImage: null,
      user: null,
      unsubscribe: null,
      usertype:null,
      verifie:null
    };
  },
  computed: {
        userDetails() {
        return this.$store.state.userDetails;
        },
    },
  async mounted() {
    await this.$store.dispatch('fetchUserDetails');
    this.email = this.userDetails?.email ?? '';
    this.usertype = this.userDetails?.photoURL ?? '';
    this.verifie = this.userDetails?.emailVerified ?? '';
    this.unsubscribe = auth.onAuthStateChanged(user => {this.user = user;
      if (!user) {this.$router.push('/');}
      if(this.usertype!=='proprietaire'){Swal.fire('Cree un compte proprietaire pour accede a cette page');this.$router.push('/');}
      if(!this.verifie){Swal.fire('Vous devez verifie votre email avant pour accede a cette page1');this.$router.push('/vericationemail');}
    });
    await this.getUserInfo(); // Attendre que getUserInfo soit terminé
    await this.getUploadedImages(); // Ensuite, récupérer les images
  },
  methods: {
    async getUploadedImages() {
      const imagesRef = ref(storage, `Stades/${this.userInfo.stadiumName}/`);
      try {
        const res = await listAll(imagesRef);
        const promises = res.items.map(item => getDownloadURL(item).then(url => ({ url, name: item.name })));
        this.images = await Promise.all(promises);
      } catch (error) {
        console.error('Error getting uploaded images:', error);
      }
    },
    deleteImage(image) {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          const imageRef = ref(storage, `Stades/${this.userInfo.stadiumName}/` + image.name);
          deleteObject(imageRef)
            .then(() => {
              Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success"
              });
              console.log("Image deleted successfully!");
              this.getUploadedImages();
            })
            .catch(error => {
              console.error("Error deleting image:", error);
            });
        }
      });
    },  

    async getUserInfo() {
      const usersRef = collection(db, 'proprietaire');
      const q = query(usersRef, where("email", "==", this.email));
      try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          this.userInfo = {...doc.data(), id: doc.id}; // Ajouter l'ID du document
        });
      } catch (error) {
        console.error('Error getting user info:', error);
      }
    },
    async modifierInformations() {
      Swal.fire({
        title: "enregsitré le changement?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Oui",
        denyButtonText: `Non`
      }).then((result) => {
        if (result.isConfirmed) {
            const userRef = doc(db, 'proprietaire', this.userInfo.id); // Utiliser l'ID du document
            updateDoc(userRef, this.userInfo);
          Swal.fire("changement enregsitré!", "", "success");
        } else if (result.isDenied) {
          Swal.fire("changement annulé", "", "info");
        }
      });
      
    },
    selectNewImage(event) {
      this.newImage = event.target.files[0];
    },
    async uploadNewImage() {
      const storageRef = ref(storage, `Stades/${this.userInfo.stadiumName}/${this.newImage.name}`);
      try {
        await uploadBytes(storageRef, this.newImage);
        console.log("New image uploaded successfully!");
        this.newImage = null;
        this.getUploadedImages();
        Swal.fire({
          title: "Enregistré",
          text: "Image enregistré",
          icon: "success"
        });
      } catch (error) {
        console.error("Error uploading new image:", error);
      }
    },
  }
}
</script>

<style  scoped>
.container {
  display: flex;
  justify-content: space-between;
}

.images-container, .user-info-container {
  flex: 1;
  padding: 20px;
}

.images-container {
  border-right: 1px solid #ccc;
}

h2 {
  margin-bottom: 15px;
}



.delete-button {
  background-color: #f44336;
  color: #fff;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.delete-button:hover {
  background-color: #d32f2f;
}

.no-images-message {
  margin-top: 20px;
  font-style: italic;
}

/* Stylisation générale du formulaire */
.user-info-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.user-info-container h2 {
  margin-bottom: 20px;
  font-size: 24px;
}

.user-info-container label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.user-info-container input[type="text"],
.user-info-container input[type="email"] {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.user-info-container input[type="text"]:focus,
.user-info-container input[type="email"]:focus {
  outline: none;
  border-color: #007bff;
}

.user-info-container button {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.user-info-container button:hover {
  background-color: #0056b3;
}
.images-container {
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
}

.image-item {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-direction: column; /* Ajouter cette ligne */
}

.image-item img {
  width: 250px;
  height: auto;
  margin-bottom: 15px; /* Ajouter cette ligne */
}

</style>