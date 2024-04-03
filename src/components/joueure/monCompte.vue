<template>
  <div class="container">
    <h1>Page de compte</h1>
    <div v-if="queryResult.length > 0">
      <form @submit.prevent="modifierDonnees">
        <img :src="logoUrl" alt="Logo de l'équipe">
        <ul>
          <li v-for="(user, index) in queryResult" :key="index">
            <label for="nom">Nom:</label>
            <input type="text" id="nom" v-model="user.nom">
            <label for="photo">Photo:</label>
            <input type="file" id="photo" @change="handlePhotoChange">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="user.email" disabled>
            <label for="age">Age:</label>
            <input type="number" id="age" v-model="user.age">
            <label for="telephone">Numéro de téléphone:</label>
            <input type="tel" id="telephone" v-model="user.telephone">
            <label for="poste">Poste:</label>
            <input type="text" id="poste" v-model="user.poste">
            <label for="ville">Ville:</label>
            <input type="text" id="ville" v-model="user.ville">
            <label for="niveau">Niveau:</label>
            <input type="text" id="niveau" v-model="user.niveau">
          </li>
        </ul>
        <button type="submit">Enregistrer</button>
      </form>
    </div>
    <div v-else>
      Aucun utilisateur trouvé.
    </div>
  </div>
</template>

<script>
import { db, storage,auth } from "../../firebase/firebase"; // Import db and storage from init.js
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL,uploadBytes,deleteObject, ref as storageRef } from "firebase/storage";
import Swal from 'sweetalert2'

export default {
    data() {
      return {
        storedEmail: '',
        queryResult: [],
        logoUrl: '',
        user: null,
        unsubscribe: null,
        usertype:null,
        verifie:null
      }
    },
    computed: {
        userDetails() {
        return this.$store.state.userDetails;
        },
    },
  async mounted() {
    await this.$store.dispatch('fetchUserDetails');
    this.storedEmail = this.userDetails?.email ?? '';
    this.usertype = this.userDetails?.photoURL ?? '';
    this.verifie = this.userDetails?.emailVerified ?? '';
    this.unsubscribe = auth.onAuthStateChanged(user => {this.user = user;
      if(this.usertype!=='joueur'){Swal.fire('Cree un compte joueur pour accede a cette page');this.$router.push('/');}
      if(!this.verifie){Swal.fire('CompteJoueuer');this.$router.push('/vericationemail');}
    });
    await this.afficheDonnees();
  },
  methods: {
    async afficheDonnees() {
      if (!this.storedEmail) return;
      const usersRef = collection(db, 'joueures');
      const q = query(usersRef, where("email", "==", this.storedEmail));
      const querySnapshot = await getDocs(q);
      this.queryResult = [];
      querySnapshot.forEach(doc => {
        const userData = { ...doc.data(), id: doc.id };
        this.queryResult.push(userData);
        this.storedNom = userData.nom; // Stocker le nom de l'utilisateur
      });
      const storageRef = ref(storage, `joueurs/${this.storedNom}/photo`);
      this.logoUrl = await getDownloadURL(storageRef);
    },
    async modifierDonnees() {
      try {
        const userRef = doc(db, 'joueures', this.queryResult[0].id); // Utiliser l'ID du document
        await updateDoc(userRef, this.queryResult[0]);
        Swal.fire("Données mises à jour avec succès !");
      } catch (error) {
        console.error("Erreur lors de la mise à jour des données :", error);
      }
    },
    async handlePhotoChange(event) {
      const file = event.target.files[0];
      Swal.fire({
        title: "Changer votre photo?",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Changer",
      }).then(async(result) => {
        if (result.isConfirmed) {
          try {
            const image = event.target.files[0];

            // Créez une référence à l'ancienne photo du joueur
            const oldPhotoRef = ref(storage, `joueurs/${this.storedNom}/photo`);

            // Supprimez l'ancienne photo du joueur si elle existe
            await deleteObject(oldPhotoRef).catch(() => {}); // Ignore les erreurs si l'objet n'existe pas

            // Créez une référence pour le nouveau fichier photo dans Firebase Storage
            const newPhotoStorageRef = ref(storage, `joueurs/${this.storedNom}/photo`);

            // Téléversez le nouveau fichier dans le stockage
            await uploadBytes(newPhotoStorageRef, image);

            // Mettez à jour l'URL de la photo dans la base de données Firestore
            const photoUrl = await getDownloadURL(newPhotoStorageRef);
            await updateDoc(doc(db, 'joueures', this.queryResult[0].id), {
              photoUrl: photoUrl
            });
            Swal.fire('logo change avec succe')
            // Mettez à jour l'URL de la photo dans votre composant
            this.logoUrl = photoUrl;
          } catch (error) {
            console.error("Erreur lors de la mise à jour de la photo :", error);
          }
        }
      });
    },
  }
}
</script>
<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

form {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="text"],
input[type="email"],
input[type="number"],
input[type="password"],
input[type="tel"] {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-sizing: border-box;
}

button[type="submit"] {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button[type="submit"]:hover {
  background-color: #0056b3;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 20px;
}

img {
  display: block;
  margin: 0 auto;
  max-width: 200px;
  margin-bottom: 20px;
}

</style>
