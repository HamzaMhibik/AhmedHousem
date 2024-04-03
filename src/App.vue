<template>
  <header>
    <nav v-if="userDetails.photoURL === 'joueur'&&userDetails.emailVerified">
      <center>
        <router-link to="/" class="link">Accueil</router-link> 
        <router-link to="/demande" class="link">Demande</router-link>
        <router-link to="/stade" class="link">Stades</router-link>
        <router-link to="/tournoi" class="link">Tournoi</router-link>
        <router-link to="/listequipes" class="link">Liste des Équipes</router-link>      
        <router-link to="/comptejoueur" class="link">Mon Compte</router-link>
        <button @click="deconnect">Se déconnecter</button>
      </center>
    </nav>
    <nav v-else-if="userDetails.photoURL === 'equipe'&&userDetails.emailVerified">
      <center>
        <router-link to="/" class="link">Accueil</router-link> 
        <router-link to="/stade" class="link">Stades</router-link>
        <router-link to="/tournoi" class="link">Tournoi</router-link>
        <router-link to="/listequipes" class="link">Liste des Équipes</router-link>      
        <router-link to="/defispropose" class="link">Défis</router-link>
        <router-link to="/mesrecrutement" class="link">Mes Recrutements</router-link>
        <router-link to='/compteEquipe' class="link">Compte Équipe</router-link>
        <button @click="deconnect">Se déconnecter</button>
      </center>
    </nav>
    <nav v-else-if="userDetails.photoURL === 'proprietaire'&&userDetails.emailVerified">
      <center>
        <router-link to="/" class="link">Accueil</router-link> 
        <router-link to="/emploi" class="link">Emploi</router-link>
        <router-link to="/MesTournois" class="link">Mes Tournois</router-link>
        <router-link to="/creetournoi" class="link">Créer un Tournoi</router-link>
        <router-link to="/stade" class="link">Stades</router-link>
        <router-link to="/tournoi" class="link">Tournoi</router-link>
        <router-link to='/compteStade' class="link">Compte Stade</router-link>
        <button @click="deconnect">Se déconnecter</button>
      </center>
    </nav>
    <nav v-else-if="userDetails.photoURL&&!userDetails.emailVerified">
      <center>
        <router-link to="/" class="link">Accueil</router-link> 
        <router-link to="/stade" class="link">Stades</router-link>
        <router-link to="/tournoi" class="link">Tournoi</router-link>
        <router-link to="/listequipes" class="link">Liste des Équipes</router-link>
        <router-link to="/vericationemail" class="link">Valide Email</router-link>
        <button @click="deconnect">Se déconnecter</button>
      </center>
    </nav>
    <nav v-else>
      <center>
        <router-link to="/" class="link">Accueil</router-link> 
        <router-link to="/stade" class="link">Stades</router-link>
        <router-link to="/tournoi" class="link">Tournoi</router-link>
        <router-link to="/listequipes" class="link">Liste des Équipes</router-link>
        <select class="link" v-model="selectedType" @change="seConnecter">
          <option value="">Se connecter</option>
          <option value="proprietaire">Proprietaire</option>
          <option value="equipe">Equipe</option>
          <option value="joueur">Joueur</option>
        </select>
        <router-link to="/create" class="link">S'inscrire</router-link>
      </center>
    </nav>
    <router-view></router-view>
  </header>
</template>
<style lang="scss"  scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
nav {
  border: black solid 2px;
  padding: 30px;
  background-color: burlywood;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.link,button{
  border: 1px solid blue;
  padding: 10px;
  background-color: bisque;
  border-radius: 10px;
  margin-right: 10px;
}
</style>
<style>
@import '~bootstrap/dist/css/bootstrap.min.css';
</style>

<script>
import { auth } from "./firebase/firebase";
import { signOut,onAuthStateChanged  } from 'firebase/auth'
import Swal from 'sweetalert2'

export default {
  data() {
    return {
      selectedType: '',
      userauth:''
    };
  },
  computed: {
    userDetails() {
      return this.$store.state.userDetails;
    },
  },
  async mounted() {
    await this.$store.dispatch('fetchUserDetails');
    onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          // Email is verified
          console.log("Email is verified");
        } else {
          // Email is not verified
          console.log("Email is not verified");
        }
      } else {
        // User is signed out
        console.log("User is signed out");
      }
    });
  },
  methods: {
    async deconnect() {
      Swal.fire({
        title: "Se déconnecter?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Annuler",
        denyButtonText: `Se déconnecter`
      }).then(async (result) => {
        if (result.isDenied) {
          // Redirection vers une autre page
          this.$router.push('/');

          // Déconnexion et actualisation après un court délai
          setTimeout(async () => {
            await signOut(auth)
              .then(() => {
                this.$store.commit('RESET_PHOTO_URL');
                location.reload(); // Actualisation de la page
              })
              .catch(error => {
                console.error('Error signing out:', error);
              });
          }, 1000); // Délai d'une seconde avant la déconnexion et l'actualisation
        }
      });
    },


    async seConnecter() {
      switch (this.selectedType) {
          case 'proprietaire':
              await this.$router.push({ path: 'seConnecter2', query: { type: 'proprietaire' }});
              window.location.reload();
              break;
          case 'equipe':
              await this.$router.push({ path: 'seConnecter2', query: { type: 'equipe' }});
              window.location.reload();
              break;
          case 'joueur':
              await this.$router.push({ path: 'seConnecter2', query: { type: 'joueur' }});
              window.location.reload();
              break;
          default:
              // Handle the case where no type is selected
              break;
      }
  }

  }
};
</script>




