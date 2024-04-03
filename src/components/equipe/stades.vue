<template>
  <div>
    <h2>Liste des stades enregistrés</h2>
    <div class="filter-nav">
      <div class="filter-container">
        <label for="villeFilter">Choisir une ville :</label>
        <select v-model="selectedVille" @change="filterStades">
          <option value="">Toutes les villes</option>
          <option v-for="ville in villes" :value="ville">{{ ville }}</option>
        </select>
      </div>
      <div class="filter-container">
        <label for="prixFilter">Choisir un prix de réservation :</label>
        <select v-model="selectedPrix" @change="filterStades">
          <option value="">Tous les prix</option>
          <option v-for="prix in prixOptions" :value="prix.value">{{ prix.label }}</option>
        </select>
      </div>
      <div class="filter-container">
        <label for="noteFilter">Choisir une note minimale :</label>
        <select v-model="noteMinimale" @change="filterStades">
          <option value="">Toutes les notes</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <!-- Ajoutez d'autres options au besoin -->
        </select>
      </div>

    </div>
    <div class="stades-container">
      <div v-if="stades.length === 0" class="empty-message">
        <p class="pp">Aucun stade enregistré pour le moment.</p>
      </div>
      <div v-else>
        <div v-for="(stade, index) in stades" :key="index" class="stade-card">
  <div class="stade-info">
    <div class="stade-image">
      <div v-if="stade.images && stade.images.length > 0" class="image-grid">
        <div v-for="(image, i) in stade.images" :key="i" class="image-item">
          <img :src="image.url" alt="Stade Image">
        </div>
      </div>
    </div>
    <div class="stade-details">
      <h3>{{ stade.stadiumName }}</h3>
      <p><strong>Ville:</strong> {{ stade.ville }}</p>
      <p><strong>Prix de réservation:</strong> {{ stade.reservationPrice }} dt</p>
      <p><strong>note de stade:</strong> <p v-if="stade.sovote/stade.nbvote">{{ stade.sovote/stade.nbvote}}/10</p><p v-else>pas encore note</p></p>
      <button v-if="storedType=='equipe'" @click="reserver(stade)">Réserver</button>
    </div>
  </div>
</div>
      </div>
    </div>
  </div>
</template>

<script>
import { db,storage,auth } from "../../firebase/firebase";
import { collection, getDocs } from 'firebase/firestore';
import { ref, listAll, getDownloadURL } from "firebase/storage";

export default {
  name: "Stades",
  data() {
    return {
      noteMinimale:'',
      stades: [],
      storedType: '',
      selectedVille: '', // Définir la valeur par défaut à une chaîne vide
      selectedPrix: '', // Définir la valeur par défaut à une chaîne vide
      villes: ['zarzis', 'mednine', 'jerbe', 'gabes', 'sfax'], // Liste des villes disponibles
      prixOptions: [
        { label: 'Moins de 50 DT', value: '<50' },
        { label: '50 - 100 DT', value: '50-100' },
        { label: 'Plus de 100 DT', value: '>100' }
      ], // Options de prix de réservation
      intervalleNote: '',
    };
  },
  computed: {
        userDetails() {
        return this.$store.state.userDetails;
        },
    },
  async mounted() {
    await this.fetchStades();
    await this.fetchImagesForStades();
    await this.$store.dispatch('fetchUserDetails');
    this.storedType = this.userDetails?.photoURL ?? '';
    
  },
  methods: {
    async fetchStades() {
      const colRef = collection(db, 'proprietaire');
      const querySnapshot = await getDocs(colRef);
      console.log(querySnapshot)
      querySnapshot.forEach((doc) => {
        this.stades.push(doc.data());
      });
      const villesAvecStades = this.stades.map(stade => stade.ville);
      this.villes = [...new Set(villesAvecStades)];
    },

    async fetchImagesForStades() {
      for (let i = 0; i < this.stades.length; i++) {
        const stade = this.stades[i];
        const imagesRef = ref(storage, `Stades/${stade.stadiumName}/`);
        await listAll(imagesRef).then(async (res) => {
          if (res.items.length > 0) {
            const firstImage = res.items[0]; // Récupère uniquement la première image
            const imageUrl = await getDownloadURL(firstImage);
            this.stades[i].images = [{ url: imageUrl }]; // Ajoute seulement la première image au tableau d'images
          }
        }).catch((error) => {
          console.error('Error getting uploaded images:', error);
        });
      }
    },

    reserver(stade) {
      this.$router.push({ path: 'reserver', query: { stade: stade.stadiumName } });
    },
    async filterStades() {
  // Réinitialiser les stades pour afficher tous les stades
  this.stades = [];

  // Refetch les stades selon la ville sélectionnée
  const colRef = collection(db, 'proprietaire');
  const querySnapshot = await getDocs(colRef);
  querySnapshot.forEach(async (doc) => {
    const stade = doc.data();
    const noteStade = stade.sovote / stade.nbvote;

    if ((!this.selectedVille || stade.ville === this.selectedVille) &&
        (!this.selectedPrix || this.checkPrice(stade.reservationPrice)) &&
        (this.noteMinimale === '' || noteStade >= parseInt(this.noteMinimale))) {
      // Ajouter le stade à la liste des stades
      this.stades.push(stade);
    }
  });

  // Une fois que les stades sont filtrés, charger les images pour ces stades
  await this.fetchImagesForStades();
},
    checkPrice(reservationPrice) {
      if (this.selectedPrix === '<50') {
        return reservationPrice < 50;
      } else if (this.selectedPrix === '50-100') {
        return reservationPrice >= 50 && reservationPrice <= 100;
      } else if (this.selectedPrix === '>100') {
        return reservationPrice > 100;
      }
      return true; // Si aucune option de prix n'est sélectionnée, retourne true
    }
  

  }
}
</script>


<style scoped>
  

  h2 {
    color: #333;
    margin-top: 0;
    margin-left: 700px
  }

  .filter-container {
    margin-bottom: 20px;
  }

  .stades-container {
    margin-left: 200px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .stade-card {
    background-color: #edc2c2;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    width:800px;
    margin-left:150px
    /* For a three-column layout */
  }

  .stade-card h3 {
    color: #333;
    margin-top: 0;
    margin-bottom: 10px;
  }

  .stade-card p {
    color: #777;
    margin-bottom: 5px;
  }

  .image-grid {
    max-width: 200px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .image-item {
  width: calc(100% - 5px); /* Pour une disposition sur deux colonnes avec une marge de 5px entre les colonnes */
  margin-bottom: 10px;
}

.image-item img {
  width: 100%; /* Définissez la largeur de l'image à 100% pour qu'elle remplisse complètement son conteneur */
  height: auto; /* La hauteur automatique garantit que l'image conserve ses proportions */
  border-radius: 5px; /* Ajoutez une bordure arrondie à l'image */
}


  .empty-message {
    color: #777;
  }

  button {
    background-color: #eec80b;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #ffa500;
  }
  .stade-info {
    display: flex;
    align-items: center;
  }

  .stade-image {
    flex: 0 0 auto;
    margin-right: 20px;
  }

  .stade-details {
    flex: 1 1 auto;
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

.stades-container {
  margin-left: 220px; /* Décalez le contenu principal pour faire de la place pour le filtre */
}
.pp{
  margin:100px
}
</style>