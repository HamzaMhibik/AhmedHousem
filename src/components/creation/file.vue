<template>
  <form @submit.prevent="signUp()">
    <label >Nom complet :</label><br>
    <input type="text" v-model="username" required><br><br>

    <label >Téléphone :</label><br>
    <input type="tel" v-model="telephone"  required><br><br>

    <label >Email :</label><br>
    <input type="email" v-model="email" required><br><br>

    <label >mot de passe :</label><br>
    <input type="password" v-model="password" required><br><br>
    <label for="confirmer_mot_de_passe">Confirmer le mot de passe :</label><br>
    <input type="password" id="confirmer_mot_de_passe" v-model="confirmerMotDePasse" required><br>
    <div v-if="confirmerMotDePasse!=='' &&confirmerMotDePasse!==password">Mot de passe de corespoand pas</div><br>

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
    <input type="file" id="image_joueur" accept=".png,.jpg" @change="handleImageChange" required><br><br>

    <input type="submit" value="Créer le joueur">
    <div  v-if="errorMessage1" class="alert alert-danger">{{ errorMessage1 }}</div>
    <div v-if="errorMessage2" class="alert alert-danger">{{ errorMessage2 }}</div>
</form>
</template>

<script>
import { auth,db,storage } from "../../firebase/firebase";
import { createUserWithEmailAndPassword,updateProfile } from 'firebase/auth';
import { collection, addDoc,getDocs,query,where } from 'firebase/firestore';
import { ref, uploadBytes } from "firebase/storage";



export default {
  data() {
    return {
      username: '',
      email:    '',
      password: '',
      confirmerMotDePasse:'',
      telephone:'',
      age: '',
      ville:'',
      poste:'',
      niveau:'',
      imageJoueur: null,
      errorMessage1: '',
      errorMessage2:'',
    }
  },
  methods: {
      async signUp() {
          try {
              const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
              const user = userCredential.user; // Access the user object from UserCredential
              await updateProfile(user, {
                  displayName: this.username,
                  phoneNumber:this.telephone,
                  type: 'joueur'
              });

              const joueureRef = await addDoc(collection(db, "joueures"), {
                  nom: this.username,
                  email: this.email,
                  age: this.age,
                  ville: this.ville,
                  poste: this.poste,
                  niveau: this.niveau,
                  telephone: this.telephone,
              });

              // Enregistrer l'image du joueur dans Firebase Storage
              const storageRef = ref(storage, `joueurs/${this.username}/photo/`);
              await uploadBytes(storageRef, this.imageJoueur);
              localStorage.setItem('type', 'joueure')
              localStorage.setItem('email', this.email)
              this.$router.push('/');
          } catch (error) {
              console.error("Erreur lors de l'enregistrement du joueur : ", error);
          }
      }
  }
}
</script>





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
<!--  -->