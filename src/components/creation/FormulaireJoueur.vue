<template>
  <div v-if="page==='page1'">
    <form @submit.prevent="signUp()">
      <label >Nom complet :</label><br>
      <input type="text" v-model="username" required><br><br>

      <label >Email :</label><br>
      <input type="email" v-model="email" required><br><br>

      <label >mot de passe :</label><br>
      <input type="password" v-model="password" required><br><br>
      <label for="confirmer_mot_de_passe">Confirmer le mot de passe :</label><br>
      <input type="password" id="confirmer_mot_de_passe" v-model="confirmerMotDePasse" required><br>
      <div v-if="confirmerMotDePasse!=='' &&confirmerMotDePasse!==password">Mot de passe de corespoand pas</div><br>

      <label >Téléphone :</label><br>
      <input type="tel" v-model="telephone"  required><br><br>
      <label >ville :</label><br>
      <select v-model="ville" required >
        <option value="zarzis">Zarzis</option>
        <option value="mednine">Mednine</option>
        <option value="jerbe">Jerba</option>
        <option value="gabes">Gabes</option>
        <option value="sfax">Sfax</option>

      </select><br><br>

      <label >age :</label><br>
      <input type="text" v-model="age" required><br><br>
      <label >Niveau :</label><br>
      <select v-model="niveau" required >
        <option value="">Choisir votre Niveau</option>
        <option value="debutant">debutant</option>
        <option value="intermedier">intermedier</option>
        <option value="professionnel">professionnel</option>
      </select><br><br>

      <label >Poste :</label><br>
      <select v-model="poste" required >
        <option value="">Sélectionner un poste</option>
        <option value="gardien">Gardien</option>
        <option value="défenseur">Défenseur</option>
        <option value="milieu">Milieu</option>
        <option value="attaquant">Attaquant</option>
      </select><br><br>
      <label for="image_joueur">Image du joueur :</label><br>
      <input type="file" ref="myfiles" id="image_joueur" accept=".png,.jpg" @change="handleImageChange" required><br><br>
      
      <input type="submit" value="Créer le joueur">
      <div  v-if="errorMessage1" class="alert alert-danger">{{ errorMessage1 }}</div>
      <div v-if="errorMessage2" class="alert alert-danger">{{ errorMessage2 }}</div>
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
  
  input,select{
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
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
import { auth, db, storage } from "../../firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification,signInWithEmailAndPassword  } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes } from "firebase/storage";

export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmerMotDePasse: '',
      telephone: '',
      age: '',
      ville: '',
      poste: '',
      niveau: '',
      imageJoueur: null,
      errorMessage1: '',
      errorMessage2: '',
      page: 'page1',
      emailVerified: false // Nouvelle propriété pour stocker l'état de l'e-mail vérifié
    }
  },
  computed: {
    userDetails() {
      return this.$store.state.userDetails;
    },
  },
  async mounted() {
    await this.$store.dispatch('fetchUserDetails');
    this.unsubscribe = auth.onAuthStateChanged(user => {this.user = user;
      if (user) {this.$router.push('/');}})
  },
  methods: {
    async signUp() {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        if (!userCredential) {
          return
        }
        const user = userCredential.user;
        await updateProfile(user, {
          displayName: this.username,
          photoURL: 'joueur',
        });
        await sendEmailVerification(user);
        
        const joueureRef = await addDoc(collection(db, "joueures"), {
          nom: this.username,
          email: this.email,
          age: this.age,
          ville: this.ville,
          poste: this.poste,
          niveau: this.niveau,
          telephone: this.telephone,
        });
        const files = this.$refs.myfiles.files;
        const imagesRef1 = ref(storage, `joueurs/${this.username}/`);
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const storageRef = ref(imagesRef1, `photo`);
          uploadBytes(storageRef, file);
        }
        this.page = 'page2';
      } catch (error) {
        this.errorMessage1 = error;
      }
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


  
  


