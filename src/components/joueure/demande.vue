<template>
  <div class="demandes-recrutement">
    <h2>Liste des demandes de recrutement</h2>
    <!-- Ajouter des champs de formulaire pour filtrer -->
    <div class="filter-nav">
      <label for="ville">Ville:</label>
      <select v-model="selectedVille" @change="filterDemandes">
        <option value="">Toutes les villes</option>
        <option v-for="ville in villes" :key="ville">{{ ville }}</option>
      </select>
      <br><br><br>
      <label for="poste">Poste:</label>
      <select v-model="selectedPoste" @change="filterDemandes">
        <option value="">Tous les postes</option>
        <option v-for="poste in postes" :key="poste">{{ poste }}</option>
      </select>
      <br><br><br>
      <label for="niveau">Niveau:</label>
      <select v-model="selectedNiveau" @change="filterDemandes">
        <option value="">Tous les niveaux</option>
        <option v-for="niveau in niveaux" :key="niveau">{{ niveau }}</option>
      </select>
    </div>
    <ul>
      <!-- Utiliser la liste filtrée des demandes -->
      <li v-for="demande in filteredDemandes" :key="demande.id" class="demande-item">
        <!-- Afficher les détails de la demande -->
        <img :src="demande.logo" alt="Logo de l'équipe"><br>
        <span class="label">Nom de l'équipe :</span> {{ demande.equipename }}<br>
        <span class="label">Âge entre {{ demande.ageMin }} et {{ demande.ageMax }}</span><br>
        <span class="label">Poste :</span> {{ demande.poste }}<br> 
        <span class="label">Niveau :</span> {{ demande.niveau }}<br>
        <span class="label">ville de l'équipe :</span> {{ demande.ville }}<br>
        <center><h3>Contacts</h3></center>
        <span class="label">Email de l'équipe :</span> {{ demande.email }}<br>
        <span class="label">Numéro de l'équipe :</span> {{ demande.numero }}<br>
        <center><button @click="enregistrerJoueur(demande)" class="btn btn-secondary">postuler</button></center>
        <div v-if="message" class="message">{{ message }}</div>
      </li>
    </ul>
  </div>
</template>
<style scoped>
.demandes-recrutement {  
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

ul {
  list-style: none;
  padding: 0;
}

.demande-item {
  background-color: #9b9898;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.label {
  font-weight: bold;
}

img {
  display: block;
  margin: 0 auto;
  max-width: 200px;
  margin-bottom: 10px;
}
.filter-nav {
  border: 2px solid black;
  margin-top: 109px;
  position: absolute;
  top: 0;
  left: 0;
  width: 200px; /* Largeur du filtre */
  height: 100%; /* Hauteur pour remplir l'écran */
  background-color: #bdb2b2; /* Couleur de fond */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Ombre */
  padding: 20px; /* Espacement intérieur */
  z-index: 100; /* Assurez-vous qu'il est au-dessus du contenu */
}
ul{
  margin-left: 110px;
  width: 600px;
}
  </style>
<script>
import { db } from "../../firebase/firebase";
import { auth } from "../../firebase/firebase";
import { collection, query, where, getDocs, getDoc,doc ,updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2'


export default {
  name: 'ListeDemandesRecrutement',
  data() {
    return {
      demandes: [],
      storedEmail: '',
      // Ajouter des variables pour stocker les valeurs sélectionnées dans les filtres
      selectedVille: "",
      selectedPoste: "",
      selectedNiveau: "",
      joueure:'',
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
        filteredDemandes() {
      let filtered = this.demandes;
      if (this.selectedVille) {
        filtered = filtered.filter(demande => demande.ville === this.selectedVille);
      }
      if (this.selectedPoste) {
        filtered = filtered.filter(demande => demande.poste === this.selectedPoste);
      }
      if (this.selectedNiveau) {
        filtered = filtered.filter(demande => demande.niveau === this.selectedNiveau);
      }
      return filtered;
    },
    // Extraire les valeurs uniques pour chaque critère de filtrage
    villes() {
      return [...new Set(this.demandes.map(demande => demande.ville))];
    },
    postes() {
      return [...new Set(this.demandes.map(demande => demande.poste))];
    },
    niveaux() {
      return [...new Set(this.demandes.map(demande => demande.niveau))];
    }
    },
  async mounted() {
    await this.$store.dispatch('fetchUserDetails');
    this.storedEmail = this.userDetails?.email ?? '';
    this.usertype = this.userDetails?.photoURL ?? '';
    this.verifie = this.userDetails?.emailVerified ?? '';
    this.unsubscribe = auth.onAuthStateChanged(user => {this.user = user;
      if(this.usertype!=='joueur'){Swal.fire('Cree un compte joueur pour accede a cette page');this.$router.push('/');}
      if(!this.verifie){Swal.fire('demandejoueur');this.$router.push('/vericationemail');}
    });
    this.fetchJoueureByEmail(this.storedEmail)
  },
  async created() {
    try {
      const querySnapshot = await getDocs(collection(db, "recrutement"));
      querySnapshot.forEach(doc => {
        this.demandes.push({...doc.data(), id: doc.id});
      });
      console.log("Demandes de recrutement récupérées avec succès !");
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes de recrutement :", error);
    }
  },
  methods: {
    async enregistrerJoueur(demande) {
    try {
        // Vérifier si le joueur a déjà postulé à cette demande
        const demandeRef = doc(db, "recrutement", demande.id);
        const demandeData = (await getDoc(demandeRef)).data();
        const joueurs = demandeData.joueurs || [];
        const joueurExiste = joueurs.some(joueur => joueur.email === this.storedEmail);

        if (joueurExiste) {
            // Afficher une alerte si le joueur a déjà postulé
            Swal.fire("Vous avez déjà postulé à cette demande !", "", "info");
        } else {
            // Procéder à l'enregistrement si le joueur n'a pas encore postulé
            const result = await Swal.fire({
                title: "Postuler à cette demande?",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Oui",
                denyButtonText: "Non"
            });

            if (result.isConfirmed) {
                // Récupérer les données du joueur à enregistrer
                const joueurData = this.joueure;

                // Mettre à jour la demande de recrutement avec les données du joueur
                const demandeRef = doc(db, "recrutement", demande.id);

                // Récupérer les données de tous les joueurs déjà enregistrés dans la demande de recrutement
                const demandeData = (await getDoc(demandeRef)).data();
                let joueurs = demandeData.joueurs || []; // S'il n'y a pas encore de joueurs, initialiser à une liste vide

                // Ajouter les données du joueur actuel à la liste des joueurs
                joueurs.push(joueurData);

                // Mettre à jour la demande de recrutement avec la nouvelle liste de joueurs
                await updateDoc(demandeRef, {
                    joueurs: joueurs
                });

                // Mettre à jour localement la liste de joueurs dans la demande
                demande.joueurs = joueurs;

                // Afficher un message de succès
                Swal.fire("Vous avez bien postulé à cette demande !", "", "success");
            } else if (result.isDenied) {
                // Afficher un message si la postulation est annulée
                Swal.fire("Postulation annulée", "", "info");
            }
        }
    } catch (error) {
        console.error("Erreur lors de la vérification de la postulation du joueur :", error);
    }
},

    async fetchJoueureByEmail(storedEmail) {
      try {
        console.log('joueure fetched succesfully')
        const q = query(collection(db, "joueures"), where("email", "==", storedEmail));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async doc => {
          this.joueure = {...doc.data(), id: doc.id}; // Ajouter l'ID du document
        });
        console.log(this.joueure)
      } catch (error) {
        console.error("Erreur lors de la récupération de l'équipe : ", error);
      }
    },
    // Méthode pour appliquer les filtres
    filterDemandes() {
      // Ne rien faire ici, car les filtres sont appliqués automatiquement grâce à computed: filteredDemandes
    },
    

  }
}

</script>
 
