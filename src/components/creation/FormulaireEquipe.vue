<template>
  <div v-if="page==='page1'">
  <br>
  <form class="equipe" @submit.prevent="enregistrerEquipe">
    <label for="nom_equipe">Nom de l'équipe :</label>
    <input type="text" id="nom_equipe" v-model="nomEquipe" required><br><br>
    
    <label for="nom_capitaine">Nom du capitaine :</label>
    <input type="text" id="nom_capitaine" v-model="nomCapitaine" required>
    
    <label for="email">Email :</label>
    <input type="email" id="email" v-model="email" required>

    <div v-if="emailExistsError" class="error-message">
      L'e-mail est déjà utilisé. Veuillez choisir un e-mail différent.
    </div>


    <label for="telephone">telephone :</label>
    <input type="number" id="telephone" v-model="telephone" required>
    
    <label for="mot_de_passe">Mot de passe :</label>
    <input type="password" id="mot_de_passe" v-model="password" required>

    <label for="confirmer_mot_de_passe">Confirmer le mot de passe :</label>
    <input type="password" id="confirmer_mot_de_passe" v-model="confirmerMotDePasse" required>
    <div v-if="confirmerMotDePasse!=='' &&confirmerMotDePasse!==password">Mot de passe de corespoand pas</div>
    
    <label >ville :</label><br>
      <select v-model="ville" required >
          <option value="zarzis">Zarzis</option>
          <option value="mednine">Mednine</option>
          <option value="jerbe">Jerba</option>
          <option value="gabes">Gabes</option>
          <option value="sfax">Sfax</option>

      </select><br><br>
    
    <fieldset>
      <legend>Liste des joueurs de l'équipe :</legend>
      <div id="joueurs">
        <div v-for="joueur in joueurs" :key="joueur.id">
          <label :for="'joueur_' + joueur.id">Nom du joueur {{ joueur.id }} :</label>
          <input :id="'joueur_' + joueur.id" type="text" v-model="joueur.nom" required>
        </div>
      </div>
    </fieldset><br>
    
    <label for="logo_equipe">Logo de l'équipe :</label>
    <input type="file" id="logo_equipe" ref="myfiles" accept=".png,.jpg" @change="handleLogoChange" required><br><br>
    
    <button type="submit">Enregistrer l'équipe</button>
    <div v-if="emailExistsError" class="error-message">
      L'e-mail est déjà utilisé. Veuillez choisir un e-mail différent.
    </div>
    <div v-if="nomEquipeExistsError" class="error-message">
        Le nom d'équipe est déjà utilisé. Veuillez choisir un autre nom d'équipe.
      </div>
    
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

<script>
import { auth,db, storage } from "../../firebase/firebase"; // Import db and storage from init.js
import { createUserWithEmailAndPassword,updateProfile,sendEmailVerification,signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes } from "firebase/storage";

export default {
  name: 'helpComp',
  data() {
    return {
      nomEquipe: '',
      nomCapitaine: '',
      email: '',
      password: "",
      confirmerMotDePasse: "",
      telephone:'',
      ville: '',
      joueurs: Array.from({ length: 6 }, (_, index) => ({ id: index + 1, nom: '' })),
      logoEquipe: null,
      emailExistsError: false, // Nouvelle propriété pour suivre l'état de l'erreur d'e-mail existant
      passwordMismatchError: false,
      nomEquipeExistsError:false,
      page:'page1' // Nouvelle propriété pour suivre l'état de l'erreur de correspondance des mots de passe
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
    async enregistrerEquipe() {
      try {
        // Vérifier si les mots de passe saisis et confirmés correspondent
      if (this.password !== this.confirmerMotDePasse) {
        this.passwordMismatchError = true;
        throw new Error("Les mots de passe ne correspondent pas.");
      }
      //
      const equipeQuerySnapshot = await getDocs(query(collection(db, "equipes"), where("nomEquipe", "==", this.nomEquipe)));
      if (!equipeQuerySnapshot.empty) {
        this.nomEquipeExistsError=true
        // Le nom d'équipe est déjà utilisé, gérer l'erreur
        throw new Error("Le nom d'équipe est déjà utilisé. Veuillez choisir un autre nom d'équipe.");
      }

      // Check if the email is already in use
      const emailQuerySnapshot = await getDocs(query(collection(db, "equipes"), where("email", "==", this.email)));
      if (!emailQuerySnapshot.empty) {
        // Email is already in use, handle the error
        this.emailExistsError = true; // Définir l'état de l'erreur d'e-mail existant sur true
        throw new Error("Email already in use. Please choose a different email.");
      }

      // Email is not in use, proceed with registering the team
      // Reset the email exists error state
      this.emailExistsError = false;

      // Register the team
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password)
        if(!userCredential){
          return
        }
        const user = userCredential.user; // Access the user object from UserCredential
        await updateProfile(user, {
          displayName: this.nomEquipe,
          photoURL: 'equipe',
        });
        await sendEmailVerification(user);
          const equipeRef = await addDoc(collection(db, "equipes"), {
          nomEquipe: this.nomEquipe,
          nomCapitaine: this.nomCapitaine,
          email: this.email,
          ville: this.ville,
          joueurs: this.joueurs.map(joueur => joueur.nom),
          telephone: this.telephone
        });
        const files = this.$refs.myfiles.files;
        const imagesRef1 = ref(storage, `logos/`);
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const storageRef = ref(imagesRef1, this.nomEquipe);
          uploadBytes(storageRef, file);
        }
        this.page = 'page2';
      } catch (error) {
        this.emailExistsError = true;
        console.error("Error registering the team: ", error);
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

<style scoped>
.equipe {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #b8beb9;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"],
input[type="email"],
input[type="number"],
input[type="password"],
select {
  width: calc(100% - 10px);
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-sizing: border-box;
}

fieldset {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 15px;
}

legend {
  font-weight: bold;
}

button[type="submit"] {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button[type="submit"]:hover {
  background-color: #0056b3;
}

#error-message {
  color: red;
  margin-top: 10px;
}

/* Add more styles as needed */
</style>

