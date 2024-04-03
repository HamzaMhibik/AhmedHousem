<template>
    <div class="defis"><center>
    <router-link to="/defispropose" class="link">Defis proposé</router-link> 
    <router-link to="/defiscree" class="link">Defis créé</router-link>
    <router-link to="/defierEquipe" class="link">Defier un Equipe</router-link>
  </center>
  </div><br>
    <div class="container">
      <h1 class="title">Défis Créés</h1>
      <ul class="defi-list">
        <div v-if="defis.length === 0">
                <p>Il n'y a pas de défis créés pour le moment.</p>
            </div>
            <div v-else>
        <li v-for="(defi, index) in defis" :key="index" class="defi-item">
          <div class="defi-header">
            <p >Vous avez défié <strong class="equipe-name">{{ defi.equipe2 }}</strong> pour match a:</p>
            <h4>Stade: <strong class="match-details">{{ defi.stade }}</strong><br>
                Date: <strong class="match-details">{{ defi.dateMatch }}</strong> <br> 
                Heure: <strong class="match-details">{{ defi.heureMatch }}</strong></h4>
          </div>
          <div class="defi-body">
            <p class="message">Message:<strong >{{ defi.message }}</strong> </p>
            <p class="etat">État:<strong class="match-details">{{ defi.etat }}</strong> </p><br>
            <div v-if="defi.etat === 'en attent'" class="defi-actions">
            <center><button class="btn" @click="supprimerDefi(defi.id)">Annule le defis </button></center>
            </div>
            <p v-if="defi.etat === 'accepté'" class="acceptation"><strong>{{ defi.equipe2 }}</strong> ont accepté votre defi et votre match est reservé </p>
            <p v-if="defi.etat === 'refusé'" class="acceptation"><strong>{{ defi.equipe2 }}</strong> ont refusé votre defi</p>
            <p v-if="defi.etat === 'annulé'" class="acceptation"> Defi annulé car le creneau a etais reservé par un autre equipe</p>
          </div>
        </li>
      </div>
      </ul>
    </div>
    
  </template>
  <style scoped>
  .link {
      font-size: 1.5rem;
      color: #030303; /* Couleur du lien */
      text-decoration: none; /* Supprimer le soulignement */
      margin-right: 10px; /* Marge à droite pour l'espace entre les liens */
      border: 2px solid black;
      padding: 10px;
      background-color: cornflowerblue;
    }

.link:hover {
  text-decoration: underline; /* Soulignement au survol */
}
  
  .acceptation{
    font-size: 1.5rem;
  }
  .container {
  max-width: 800px;
  margin: 0 auto;
  }
  
  .title {
  text-align: center;
  margin-bottom: 30px;
  }
  
  .defi-list {
  list-style: none;
  padding: 0;
  }
  
  .defi-item {
  background-color: #bfbcbc;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .defi-header {
  margin-bottom: 10px;
  }
  
  .equipe-name {
  font-size: 20px;
  margin: 0;
  }
  
  .match-details {
    font-size: 1.25rem;
  color: #555;
  margin: 5px 0 0;
  }
  
  .message {
  margin: 0 0 10px;
  }
  
  .etat {
  margin: 0;
  }
  
  .defi-actions {
    display: flex;
    justify-content: center; /* Centrer horizontalement */
  }
  
  .btn {
  background-color: #f30808;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  }
  .refuse{
  background-color: #0872f3;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 10px;
  }
  .accepte{
  background-color: #08f320;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  }
  .defis{
  margin-top: 30px;
  padding: 20px;
}
  </style>
  <script>
  import { db,auth } from "../../../firebase/firebase";
  import { query, collection, where, getDocs, doc, updateDoc,deleteDoc} from 'firebase/firestore';
  import Swal from 'sweetalert2'
  
  export default {
    data() {
        return {
            storedEmail: '',
            equipe: '',
            defis: [],
            week:['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'],
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
          if(this.usertype!=='equipe'){Swal.fire('Cree un compte equipe pour accede a cette page');this.$router.push('/');}
          if(!this.verifie){Swal.fire('Valider votre email pour accede a cette page');this.$router.push('/vericationemail');}

        });
        await this.fetchEquipeByEmail(this.storedEmail);
        await this.fetchDefis(); // Wait for fetchEquipeByEmail to complete before fetching defis
    },
    methods: {
        async fetchEquipeByEmail(storedEmail) {
            try {
                const q = query(collection(db, "equipes"), where("email", "==", storedEmail));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(async doc => {
                    this.equipe = { ...doc.data(), id: doc.id }; // Ajouter l'ID du document
                });
            } catch (error) {
                console.error("Erreur lors de la récupération d'équipe : ", error);
            }
        },
        async fetchDefis() {
            try {
                const q = query(collection(db, "defis"), where("equipe1", "==", this.equipe.nomEquipe));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(doc => {
                    this.defis.push({ ...doc.data(), id: doc.id }); // Ajouter l'ID du document
                });
            } catch (error) {
                console.error("Erreur lors de la récupération des défis : ", error);
            }
        },
        async supprimerDefi(defiId) {
          Swal.fire({
            title: "annule le defis ?",
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "Oui",
            denyButtonText: `Non`
          }).then((result) => {
            if (result.isConfirmed) {
              try {
                const defiRef = doc(db, "defis", defiId);
                deleteDoc(defiRef); // Supprimer le document
                // Mettre à jour la liste locale en retirant le défi supprimé
                this.defis = this.defis.filter(defi => defi.id !== defiId);
                Swal.fire({
                  title: "Annulé",
                  text: "Defi annule!",
                  icon: "info"
                });
            } catch (error) {
                console.error("Erreur lors de la suppression du défi : ", error);
            }
            } else if (result.isDenied) {
            }
          });
            
        },
        async defier(){
            this.$router.push('/defierEquipe')
        }
  
    }
  }
  </script>
  