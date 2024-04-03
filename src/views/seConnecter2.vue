<template>
  <div class="container">
    <h1>Connexion</h1>
    <h2>{{ typeCreation }}</h2>
    <div v-if="typeCreation==='joueur'">
        <form @submit.prevent="loginJoueur">
            <label>Email</label>
            <input type="email" v-model="email" required>
            <label>Mot de passe</label>
            <input type="password" v-model="password" required>
            <input type="submit" value="Se connecter"><br><br>
            <div class="alert alert-danger" v-if="errer">{{ errer }}</div>
            <p @click="mdpoublie()" class="mdp"><strong>mot de passe oublie?</strong></p>
            <p>Identifiant de test : 444iqrklh5@mailcurity.com / ahmed123</p>
        </form>
    </div>
    <div v-if="typeCreation==='equipe'">
        <form @submit.prevent="loginEquipe">
            <label>Email</label>
            <input type="email" v-model="email" required>
            <label>Mot de passe</label>
            <input type="password" v-model="password" required>
            <input type="submit" value="Se connecter"><br><br>
            <div class="alert alert-danger" v-if="errer">{{ errer }}</div>
            <p @click="mdpoublie()" class="mdp"><strong>mot de passe oublie?</strong></p>
            <p>Identifiant de test : hzsf687ler@mailcurity.com / ahmed123</p>
        </form>
    </div>
    <div v-if="typeCreation==='proprietaire'">
        <form @submit.prevent="loginProprietaire">
            <label>Email</label>
            <input type="email" v-model="email" required>
            <label>Mot de passe</label>
            <input type="password" v-model="password" required>
            <input type="submit" value="Se connecter"><br><br>
            <div class="alert alert-danger" v-if="errer">{{ errer }}</div>
            <p @click="mdpoublie()" class="mdp"><strong>mot de passe oublie?</strong></p>
            <p>Identifiant de test : dh3s5axy92@mailcurity.com / ahmed123</p>
        </form>
    </div>
    <p>Identifiant de test : hmhibik@yahoo.fr1 / Hamza352001</p>
  </div>
</template>
<style scoped>
.container {
  max-width: 400px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

form {
  background-color: #84c0ef;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-sizing: border-box;
}

input[type="submit"] {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

input[type="submit"]:hover {
  background-color: #0056b3;
}

p {
  text-align: center;
  margin-top: 20px;
}
.mdp{
  text-decoration: underline;
  cursor: pointer;
}
</style>
<script>
import Swal from "sweetalert2";
import { auth, db } from "../firebase/firebase.js";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth'
export default {
  data() {
    return {
      typeCreation: null,
      email: '',
      password: '',
      errer:''
    }
  },
  created() {
    this.typeCreation = this.$route.query.type;
  },
  methods: {
    async loginJoueur() {
      const usersRef = collection(db, 'joueures');
      const q = query(usersRef, where("email", "==", this.email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size === 1) {
        signInWithEmailAndPassword(auth, this.email, this.password)
          .then(() => {
            this.$router.push('/');
          })
          .catch(error => {
            this.errer='Mot de passe incorrect'
            console.error("Error signing in:", error);
          });
      } else {
        this.errer="Il y'a pas de compte avec cette email "
        // Handle the case where the email does not exist
      }
    },
    async loginEquipe() {
      const usersRef = collection(db, 'equipes');
      const q = query(usersRef, where("email", "==", this.email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size === 1) {
        signInWithEmailAndPassword(auth, this.email, this.password)
          .then(() => {
            this.$router.push('/');
          })
          .catch(error => {
            this.errer='Mot de passe incorrect'
            console.error("Error signing in:", error);
          });
      } else {
        this.errer="Il y'a pas de compte avec cette email "
        // Handle the case where the email does not exist
      }
    },
    async loginProprietaire() {
      const usersRef = collection(db, 'proprietaire');
      const q = query(usersRef, where("email", "==", this.email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size === 1) {
        signInWithEmailAndPassword(auth, this.email, this.password)
          .then(() => {
            this.$router.push('/');
          })
          .catch(error => {
            this.errer='Mot de passe incorrect'
            console.error("Error signing in:", error);
          });
      } else {
        this.errer="Il y'a pas de compte avec cette email "
        // Handle the case where the email does not exist
      }
    },
    mdpoublie(){
      this.$router.push('/password')
    }
  }
}
</script>

