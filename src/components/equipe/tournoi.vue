<template>
  <div>
    <div class="filter-nav">
      <label for="">Ville:</label>
      <div class="filter-container">
        <select v-model="selectedCity">
      <option value="">Toutes les villes</option>
      <option v-for="city in cities" :value="city">{{ city }}</option>
    </select>
    <br><br>
    <!-- Sélecteur pour filtrer par état du tournoi -->
    <label for="">Etat:</label><br>
    <select v-model="selectedState">
      <option value="">Tous les états</option>
      <option value="en_cours">En cours</option>
      <option value="pas_encore">Pas encore débuté</option>
    </select>
      </div>
    </div>
    <br>
    
    <h2>Liste des Tournois</h2>
    <div class="tournois-container">
      <div v-for="tournoi in filteredTournois" :key="tournoi.id" class="tournoi">
        <div class="images-container">
          <center><h4>Logo du tournoi :</h4>
          <img class="img" v-for="(image, index) in tournoi.images" :src="image.url" :alt="'Image ' + (index + 1)"><br>
          <h3>{{ tournoi.nom_tournoi }}</h3></center>
        </div>
        <div class="tournoi-details">
          
          <p><strong>Nom de stade de tournoi: </strong><span @click="voir(tournoi)" class="stade">{{ tournoi.nom_stade }}</span></p>
          <p><strong>Date de début:</strong> {{ tournoi.date_debut }}</p>
          <p><strong>Catégorie:</strong> {{ tournoi.categorie }}</p>
          <p><strong>ville:</strong> {{ tournoi.ville }}</p>
          <p><strong>prix d'inscription:</strong> {{ tournoi.frais_inscription }} Dt</p>
          <div v-if="new Date(tournoi.date_debut) > dateActuelle ">
            <p>pas encore debuté</p><br>
            <center><button v-if="storedType==='equipe'" @click="participer(tournoi.id)">Voir le tournoi</button></center>
          </div>
          <p v-if="new Date(tournoi.date_fin) < dateActuelle">terminé</p><br>
          <p v-if="new Date(tournoi.date_fin) > dateActuelle && new Date(tournoi.date_debut) < dateActuelle">en cours</p><br>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db,storage } from "../../firebase/firebase";
import { collection, getDocs } from 'firebase/firestore';
import { ref, listAll, getDownloadURL } from "firebase/storage";

export default {
  name: 'ListeTournois',
  data() {
    return {
      tournois: [],
      selectedCity: '',
      selectedState: '',
      cities: [],
      dateActuelle: new Date(),
      storedType:''
    }
  },
  computed: {
    // Calculez les tournois filtrés en fonction de la ville sélectionnée
    filteredTournois() {
      let filtered = this.tournois;

      // Filtrer par ville
      if (this.selectedCity !== '') {
        filtered = filtered.filter(tournoi => tournoi.ville === this.selectedCity);
      }

      // Filtrer par état
      if (this.selectedState === 'en_cours') {
        filtered = filtered.filter(tournoi => new Date(tournoi.date_debut) < this.dateActuelle && new Date(tournoi.date_fin) > this.dateActuelle);
      } else if (this.selectedState === 'termine') {
        filtered = filtered.filter(tournoi => new Date(tournoi.date_fin) < this.dateActuelle);
      } else if (this.selectedState === 'pas_encore') {
        filtered = filtered.filter(tournoi => new Date(tournoi.date_debut) > this.dateActuelle);
      }

      return filtered;
    },
        userDetails() {
        return this.$store.state.userDetails;
        },
    },
  async mounted() {
    await this.getTournois();
    await this.$store.dispatch('fetchUserDetails');
    this.storedType = this.userDetails?.photoURL ?? '';
  },
  methods: {
    async getTournois() {
  try {
    const tournoisSnapshot = await getDocs(collection(db, "tournois"));
    for (const doc of tournoisSnapshot.docs) {
      const tournoiData = doc.data();
      const images = await this.getImagesForTournoi(tournoiData.nom_tournoi, tournoiData.nomstade); // Déplacer cette ligne au-dessus de l'ajout d'objet
      this.tournois.push({
        id: doc.id,
        nom_tournoi: tournoiData.nom_tournoi,
        nom_stade: tournoiData.nomstade,
        date_debut: tournoiData.date_debut,
        date_fin: tournoiData.date_fin,
        categorie: tournoiData.categorie,
        description: tournoiData.description,
        frais_inscription: tournoiData.frais_inscription,
        nb_equipes_max: tournoiData.nb_equipes_max,
        conditions_speciales: tournoiData.conditions_speciales,
        email: tournoiData.email,
        ville: tournoiData.ville,
        images: images // Utiliser les images récupérées
      });
    }
    // Obtenez les villes uniques à partir des tournois récupérés
    this.cities = Array.from(new Set(this.tournois.map(tournoi => tournoi.ville)));
  } catch (error) {
    console.error("Erreur lors de la récupération des tournois : ", error);
  }
},

    async getImagesForTournoi(nomtournoi,nomstade) {
      const imagesRef = ref(storage, `tournois/${nomstade}/${nomtournoi}`);
      const imageUrls = [];
      const imageList = await listAll(imagesRef);
      for (const imageRef of imageList.items) {
        const imageUrl = await getDownloadURL(imageRef);
        imageUrls.push({ url: imageUrl });
      }
      return imageUrls;
    },
    voir(tournoi) {
      if(this.storedType=='equipe'){
        this.$router.push({ path: 'reserver', query: { stade: tournoi.nom_stade } });
    }
    },
    participer(tournoiId) {
      this.$router.push({ path: 'participer', query: { id: tournoiId } });
    }
  }
}
</script>
<style scoped>
h2{
  margin-left: 780px;
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
  .tournois-container {
    margin-left: 250px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .tournoi {
    border: 2px solid red;
    margin-bottom: 50px;
    display: flex;
    align-items: flex-start;
    width: calc(50% - 25px); /* 50% width with margin */
  }

  .images-container {
    margin-right: 20px;
  }

  .img {
    width: 200px;
    height: 200px;
    margin-top: 20px;
    margin-bottom: 10px;
    margin-left: 20px;
  }

  .tournoi-details {
    flex-grow: 1;
    border-left: solid 1px;
    padding-left: 20px;
  }
  select{
    max-width: 200px;
  }
  button{
  background-color: #ff6347; /* Couleur de fond */
  color: white; /* Couleur du texte */
  padding: 8px 16px; /* Espacement intérieur */
  border: none; /* Suppression de la bordure */
  border-radius: 4px; /* Arrondi des coins */
  cursor: pointer; /* Curseur au survol */
  transition: background-color 0.3s; /* Transition en cas de changement de couleur de fond */
  }
  button:hover{
    background-color: #d14836; /* Changement de couleur de fond au survol */
  }
  .stade{
  cursor: pointer;
  color: blue;
  text-decoration: underline;
  font-size: 1.25rem;
  }
</style>