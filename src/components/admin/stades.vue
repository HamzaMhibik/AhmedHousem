<template>
    <div>
      <h1>Liste des Stades Enregistrés</h1>
      <table v-if="stades.length > 0">
        <thead>
          <tr>
            <th>Nom du Stade</th>
            <th>Ville</th>
            <th>Description</th>
            <th>Prix de Réservation (DT)</th>
            <th>Adresse</th>
            <th>Téléphone</th>
            <th>Images</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(stade, index) in stades" :key="index">
            <td>{{ stade.stadiumName }}</td>
            <td>{{ stade.ville }}</td>
            <td>{{ stade.description }}</td>
            <td>{{ stade.reservationPrice }}</td>
            <td>{{ stade.address }}</td>
            <td>{{ stade.telephone }}</td>
            <td>
              <div class="images-container">
                <img v-for="(image, i) in stade.images" :key="i" :src="image" alt="Image du stade" class="stade-image">
              </div>
            </td>
            <td><button @click="deleteStade(stade.id)">Supprimer</button></td>
          </tr>
        </tbody>
      </table>
      <div v-else>Aucun stade trouvé.</div>
    </div>
  </template>
  
  <script>
  import { db, storage } from "../../firebase/firebase";
  import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
  import { ref, listAll, getDownloadURL } from "firebase/storage";
  
  export default {
    data() {
      return {
        stades: [],
      }
    },
    async mounted() {
      await this.fetchStades();
    },
    methods: {
      async fetchStades() {
        try {
          const stadesRef = collection(db, 'proprietaire');
          const querySnapshot = await getDocs(stadesRef);
          this.stades = [];
  
          querySnapshot.forEach(doc => {
            const stadeData = { id: doc.id, ...doc.data() };
            this.stades.push(stadeData);
          });
  
          // Fetch images for each stade
          await Promise.all(this.stades.map(async stade => {
            const imagesRef = ref(storage, `Stades/${stade.stadiumName}/`);
            const imagesList = await listAll(imagesRef);
            stade.images = await Promise.all(imagesList.items.map(async imageRef => {
              const imageUrl = await getDownloadURL(imageRef);
              return imageUrl;
            }));
          }));
        } catch (error) {
          console.error('Erreur lors de la récupération des stades : ', error);
        }
      },
      async deleteStade(stadeId) {
        try {
          // Supprimer le document du stade de la base de données
          await deleteDoc(doc(db, 'proprietaire', stadeId));
  
          // Supprimer les images du stade du stockage
          const imagesRef = ref(storage, `Stades/${stadeId}/`);
          const imagesList = await listAll(imagesRef);
          await Promise.all(imagesList.items.map(async imageRef => {
            await deleteDoc(imageRef);
          }));
  
          // Mettre à jour localement la liste des stades après la suppression
          this.stades = this.stades.filter(stade => stade.id !== stadeId);
  
          // Afficher une notification de succès
          console.log("Stade supprimé avec succès !");
        } catch (error) {
          console.error('Erreur lors de la suppression du stade : ', error);
          // Afficher une notification d'erreur
        }
      },
    }
  }
  </script>
  
  <style scoped>
/* Styles pour le tableau */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

thead {
  background-color: #f2f2f2;
}

th, td {
  padding: 8px;
  border: 1px solid #ddd;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}

/* Styles pour les images des stades */
.images-container {
  display: flex;
}

.stade-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 5px;
}
</style>