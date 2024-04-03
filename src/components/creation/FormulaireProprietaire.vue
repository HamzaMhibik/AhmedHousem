<template>
  <div>
    <br>
    <br>
    <div v-if="page==='page1'">
      <form @submit.prevent="createUser">
        <center>
          <label for="name" required>Ecrire votre nom</label><br>
          <input type="text" id="name" v-model="name"><br>
          <label for="email" required>Ecrire votre email</label><br>
          <input type="email" id="email" v-model="email"><br>
          <label for="password" required>Ecrire votre mot de passe</label><br>
          <input type="password" id="password" v-model="password"><br>
          <label for="confirmer_mot_de_passe">Confirmer le mot de passe :</label><br>
          <input type="password" id="confirmer_mot_de_passe" v-model="confirmerMotDePasse" required><br>
          <div v-if="confirmerMotDePasse!=='' &&confirmerMotDePasse!==password">Mot de passe de corespoand pas</div><br>
          <label for="telephone" required>Ecrire votre nimero de telephone</label><br>
          <input type="number" id="telephone" v-model="telephone"><br>
          <!-- New fields for stadium information -->
          <label for="stadiumName" required>Nom du stade</label><br>
          <input type="text" id="stadiumName" v-model="stadiumName"><br>
          <label for="reservationPrice" required>Prix de réservation</label><br>
          <input type="number" id="reservationPrice" v-model="reservationPrice"><br>
          <label for="description" required>Description</label><br>
          <textarea id="description" v-model="description"></textarea><br>
          <label >ville :</label><br>
          <select v-model="ville" required ><br>
            <option value="zarzis">Zarzis</option>
            <option value="mednine">Mednine</option>
            <option value="jerbe">Jerba</option>
            <option value="gabes">Gabes</option>
            <option value="sfax">Sfax</option>
          </select><br><br>
          <label for="address" required>Adresse</label>
          <input type="text" id="address" v-model="address">
          <label for="name" required>selectionne les images de stade</label><br>
          <input type="file" ref="myfiles" accept=".png,.jpg" :multiple="true">
          <!-- End of new fields -->
          <br>
          <input type="submit" value="VALIDER">
          <div class="alert danger-alert" v-if="erreremail">cette email est deja utilisé</div>
          <div class="alert danger-alert" v-if="errernom">cette nom de stade est deja utilisé</div>
        </center>
      </form>
    </div>
    <center>
      <div v-if="page==='page2'">
          <h1>Validation d'email</h1>
          <h3>email est {{ email }} et le mot de pass est {{ password }}</h3> 
          <p>Un email a été envoyé à votre adresse email pour valider.</p>
          <p>Veuillez cliquer sur le lien pour valider votre email.</p>
          <button @click="envoyereamil()">Renvoyer l'email</button>
          <p>Si vous avez validé votre email, cliquez ici:</p>
          <button @click="verifievalidationAfterReload()">Vérifie</button>
      </div>
    </center>
  </div>
</template>

<style  scoped>
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: white;
}

h2 {
    text-align: center;
    color: #333;
}

form {
    max-width: 500px;
    margin: 20px auto;
    background-color: greenyellow;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

label {
    font-weight: bold;
}
select,
input[type="file"],
input[type="email"],
input[type="password"],
input[type="text"],
input[type="tel"],
input[type="number"],textarea {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}
input[type="file"]{
  border: black 2px solid;
}
input[type="submit"] {
    width: 100%;
    background-color: #007bff;
    color: #fff;
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

input[type="submit"]:hover {
    background-color: #0056b3;
}

</style>
<script>
import { storage, db, auth } from "../../firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, listAll, getDownloadURL, uploadBytes } from "firebase/storage";
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
export default {
  name: "imageApp",
  data() {
    return {
      erreremail: false,
      errernom: false,
      images: [],
      ville: '',
      name: '',
      email: '',
      telephone: '',
      password: '',
      confirmerMotDePasse: '',
      stadiumName: '',
      reservationPrice: null,
      description: '',
      address: '',
      nbvote: 0,
      sovote: 0,
      errorMessage: '',
      usersrating: {},
      page: 'page1',
      emploiDuTemps1: {
        lundi: {
          "16:00 - 17:00": "vide",
          "17:00 - 18:00": "vide",
          "18:00 - 19:00": "vide",
          "19:00 - 20:00": "vide",
          "20:00 - 21:00": "vide",
          "21:00 - 22:00": "vide",
          "22:00 - 23:00": "vide",
          "23:00 - 00:00": "vide",
        },
        mardi: {
          "16:00 - 17:00": "vide",
          "17:00 - 18:00": "vide",
          "18:00 - 19:00": "vide",
          "19:00 - 20:00": "vide",
          "20:00 - 21:00": "vide",
          "21:00 - 22:00": "vide",
          "22:00 - 23:00": "vide",
          "23:00 - 00:00": "vide",
        },
        mercredi: {
          "16:00 - 17:00": "vide",
          "17:00 - 18:00": "vide",
          "18:00 - 19:00": "vide",
          "19:00 - 20:00": "vide",
          "20:00 - 21:00": "vide",
          "21:00 - 22:00": "vide",
          "22:00 - 23:00": "vide",
          "23:00 - 00:00": "vide",
        },
        jeudi: {
          "16:00 - 17:00": "vide",
          "17:00 - 18:00": "vide",
          "18:00 - 19:00": "vide",
          "19:00 - 20:00": "vide",
          "20:00 - 21:00": "vide",
          "21:00 - 22:00": "vide",
          "22:00 - 23:00": "vide",
          "23:00 - 00:00": "vide",
        },
        vendredi: {
          "16:00 - 17:00": "vide",
          "17:00 - 18:00": "vide",
          "18:00 - 19:00": "vide",
          "19:00 - 20:00": "vide",
          "20:00 - 21:00": "vide",
          "21:00 - 22:00": "vide",
          "22:00 - 23:00": "vide",
          "23:00 - 00:00": "vide",
        },
        samedi: {
          "16:00 - 17:00": "vide",
          "17:00 - 18:00": "vide",
          "18:00 - 19:00": "vide",
          "19:00 - 20:00": "vide",
          "20:00 - 21:00": "vide",
          "21:00 - 22:00": "vide",
          "22:00 - 23:00": "vide",
          "23:00 - 00:00": "vide",
        },
        dimanche: {
          "16:00 - 17:00": "vide",
          "17:00 - 18:00": "vide",
          "18:00 - 19:00": "vide",
          "19:00 - 20:00": "vide",
          "20:00 - 21:00": "vide",
          "21:00 - 22:00": "vide",
          "22:00 - 23:00": "vide",
          "23:00 - 00:00": "vide",
        },
      } // Nouvel objet pour stocker l'emploi du temps
    }
  },
  computed: {
    userDetails() {
      return this.$store.state.userDetails;
    },
  },
  async mounted() {
    await this.$store.dispatch('fetchUserDetails');
    this.unsubscribe = auth.onAuthStateChanged(user => {this.user = user;if (user) {this.$router.push('/');}})
  },
  methods: {
    
    async createUser() {
      const usersRef = collection(db, 'proprietaire');
      const emailQuery = query(usersRef, where('email', '==', this.email));
      const nameQuery = query(usersRef, where('stadiumName', '==', this.stadiumName));
      const files = this.$refs.myfiles.files;

      const [emailSnapshot, nameSnapshot] = await Promise.all([
        getDocs(emailQuery),
        getDocs(nameQuery)
      ]);

      if (!emailSnapshot.empty) {
        // Email already exists
        this.erreremail=true
        return;
      }

      if (!nameSnapshot.empty) {
        // Name already exists
        this.errernom=true
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password)
      if(!userCredential){
          return
      }
      const user = userCredential.user; // Access the user object from UserCredential
      await updateProfile(user, {
          displayName: this.stadiumName,
          photoURL: 'proprietaire',
      });
      await sendEmailVerification(user);
      const imagesRef1 = ref(storage, `Stades/${this.stadiumName}/`);
      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // Generate a unique filename
          const fileName = `image_${i + 1}.png`;
          const storageRef = ref(imagesRef1, fileName);
          uploadBytes(storageRef, file);
      }

      const colRef = collection(db, 'proprietaire');
      const dataObj = {
        name: this.name,
        email: this.email,
        password: this.password,
        stadiumName: this.stadiumName,
        reservationPrice: this.reservationPrice,
        description: this.description,
        address: this.address,
        telephone: this.telephone,
        emploiDuTemps1: this.emploiDuTemps1,
        ville:this.ville, // Ajouter l'emploi du temps aux données à enregistrer
        nbvote:this.nbvote,
        sovote: parseInt(this.sovote),
        usersrating:this.usersrating,
      };
      
      await addDoc(colRef, dataObj);
      this.page = 'page2';
    },
    async envoyereamil() {
      try {
        const user = auth.currentUser; // Récupérer l'utilisateur actuellement connecté
        if (user) {
          // Renvoyer l'e-mail de vérification
          await sendEmailVerification(user);
          console.log("L'e-mail de vérification a été renvoyé avec succès.");
        } else {
          console.error("Aucun utilisateur n'est actuellement connecté.");
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail de vérification :", error);
        this.errorMessage2 = error.message;
      }
    },
    verifievalidationAfterReload() {
      auth.signOut() // Déconnecte l'utilisateur
        .then(() => {
          // Reconnecte l'utilisateur avec ses identifiants
          return signInWithEmailAndPassword(auth, this.email, this.password);
        })
        .then(async (userCredential) => {
          const user = userCredential.user;
          if (user) {
            // L'utilisateur est connecté, vérifie si son e-mail est vérifié
            await user.reload(); // Recharge les informations de l'utilisateur pour obtenir la dernière vérification de l'e-mail
            if (user.emailVerified) {
              console.log('L\'e-mail de l\'utilisateur est vérifié.');
              this.$router.push('/')
              // Rediriger l'utilisateur vers une autre page ou effectuer une autre action
            } else {
              console.log('L\'e-mail de l\'utilisateur n\'est pas vérifié.');
              // Afficher un message à l'utilisateur ou prendre une autre action appropriée
            }
          }
        })
        .catch(error => {
          console.error('Erreur lors de la vérification de l\'e-mail après reconnexion:', error);
        });
    }
  }
}
</script>


