<template>
  <div>
    <div class="filter-nav">
      <div class="search-bar">
        <label for="">Rechercher</label>
        <input type="text" v-model="searchQuery" placeholder="Rechercher une équipe par son nom" class="recherche">
      </div>
      <div class="filter-container">
        <label for="ville">Filtrer par ville :</label>
        <select id="ville" v-model="selectedVille">
          <option value="">Toutes les villes</option>
          <option v-for="ville in villes" :value="ville">{{ ville }}</option>
        </select>
      </div>
    </div>
    <center><h1>Liste des équipes enregistrées</h1></center>

    <div v-for="equipe in filteredEquipes" :key="equipe.id" class="equipe-card">
      <div class="equipe-info">
        <div class="logo-container">
          <img :src="equipe.logoUrl" alt="Logo de l'équipe" class="logo">
        </div>
        <div class="info-container">
          <div class="info">
            <h2>{{ equipe.nomEquipe }}</h2>
            <p><strong>Capitaine :</strong> {{ equipe.nomCapitaine }}</p>
            <p><strong>Ville :</strong> {{ equipe.ville }}</p>
            <p><strong>Numéro :</strong> {{ equipe.telephone }}</p>
          </div>
        </div>
      </div>
      <div class="joueurs-container">
        <p><strong>Joueurs :</strong></p>
        <ul>
          <li v-for="(joueur, index) in equipe.joueurs" :key="index">Joueur {{index+1}}: {{ joueur }}</li>
        </ul>
      </div>
      <div class="button-container">
        <button v-if="usertype==='equipe'" class="defier-button" @click="defier(equipe)">Défier</button>
      </div>
    </div>
  </div>
</template>




  
  <script>
  import { db, storage } from "../firebase/firebase";
  import { collection, getDocs, query, where } from 'firebase/firestore';
  import { ref, getDownloadURL } from "firebase/storage";
  import Swal from "sweetalert2";

  
  export default {
    name: 'ListeEquipes',
    data() {
      return {
        equipes: [],
        villes: [], // Liste des villes disponibles
        selectedVille: '',
        searchQuery: '', 
        user: null,
        unsubscribe: null,
        usertype:null
      }
    },
    async created() {
      try {
        const equipeCollection = collection(db, 'equipes');
        const equipeSnapshot = await getDocs(equipeCollection);
  
        const equipes = [];
        const villes = new Set(); // Utiliser un ensemble pour éviter les doublons de villes
        for (const doc of equipeSnapshot.docs) {
          const equipeData = doc.data();
          const logoUrl = await this.getLogoUrl(equipeData.nomEquipe);
          equipes.push({ id: doc.id, ...equipeData, logoUrl });
          villes.add(equipeData.ville); // Ajouter la ville à l'ensemble
        }
  
        this.equipes = equipes;
        this.villes = Array.from(villes); // Convertir l'ensemble en tableau
      } catch (error) {
        console.error("Erreur lors de la récupération des équipes : ", error);
      }
    },
    computed: {
      userDetails() {
        return this.$store.state.userDetails;
      },
      filteredEquipes() {
      // Filtrer les équipes en fonction de la ville sélectionnée et de la requête de recherche
      let filtered = this.equipes;

      if (this.selectedVille !== '') {
        filtered = filtered.filter(equipe => equipe.ville === this.selectedVille);
      }

      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(equipe => equipe.nomEquipe.toLowerCase().includes(query));
      }

      return filtered;
    }
    },
    async mounted(){
      await this.$store.dispatch('fetchUserDetails');
      this.usertype = this.userDetails?.photoURL ?? '';
    },
    methods: {
      async getLogoUrl(nom) {
        const logoRef = ref(storage, `logos/${nom}/`);
        try {
          return await getDownloadURL(logoRef);
        } catch (error) {
          console.error("Erreur lors de la récupération du logo : ", error);
          return ''; // Retourner une URL vide en cas d'erreur
        }
      },
      async defier(equipe) {
        Swal.fire({
          title: `Defier ${equipe.nomEquipe} ?` ,
          showDenyButton: false,
          showCancelButton: true,
          confirmButtonText: "Defier",
        }).then((result) => {
          if (result.isConfirmed) {
            this.$router.push({ path: 'defierEquipe', query: { ville:equipe.ville , nomEquipe: equipe.nomEquipe } });
          } else if (result.isDenied) {
          }
        });
      }
    }
  }
  </script>
  
  <style scoped>
 
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

.equipe-card {
  display: flex;
  max-width: 900px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-left: 350px;
  margin-bottom: 20px;
  background-color: #fff;
}

.equipe-info {
  display: flex;
}

.info {
}

.equipe-info h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.equipe-info p {
  margin-bottom: 8px;
}

.equipe-info ul {
  padding-left: 20px;
}

.equipe-info li {
  margin-bottom: 5px;
}

/* Style pour le select */
label {
  display: block;
  margin-bottom: 5px;
}

select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100%;
  margin-bottom: 10px;
}

option {
  padding: 5px;
}

.defier-button {
  background-color: #3682f4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

/* Ajustements pour l'alignement et le positionnement */


.equipe-info {
  display: flex;
  justify-content: space-between; /* Aligner les éléments sur l'axe horizontal */
  align-items: center; /* Aligner les éléments sur l'axe vertical */
}
.equipe-card {
  display: flex;
  max-width: 900px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  background-color: #fff;
}

.logo-container {
  width: 33%;
}

.logo {
  max-width: 100%;
  max-height: 100%;
  border-radius: 20%;
}

.info-container {
  width: 60%;
  padding: 20px;
}

.joueurs-container {
  width: 33%;
  padding: 20px;
  margin-left: 50px;
}

.button-container {
  display: flex;
  align-items: center;
  padding: 20px;
}
.recherche{
  width: 170px;
}
</style>