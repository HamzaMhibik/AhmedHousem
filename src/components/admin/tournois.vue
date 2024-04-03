<template>
    <div>
      <h2>Liste des Tournois</h2>
      <table>
        <thead>
          <tr>
            <th>Logo</th>
            <th>Nom du Tournoi</th>
            <th>Date de Début</th>
            <th>Date de Fin</th>
            <th>Catégorie</th>
            <th>Description</th>
            <th>Frais d'Inscription</th>
            <th>Nombre d'Équipes Max</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tournoi in tournois" :key="tournoi.id">
            <!-- Affichage du logo du tournoi -->
            <td>
              <img :src="tournoi.logoUrl" alt="Logo du tournoi" width="50">
            </td>
            <td>{{ tournoi.nom_tournoi }}</td>
            <td>{{ tournoi.date_debut }}</td>
            <td>{{ tournoi.date_fin }}</td>
            <td>{{ tournoi.categorie }}</td>
            <td>{{ tournoi.description }}</td>
            <td>{{ tournoi.frais_inscription }}</td>
            <td>{{ tournoi.nb_equipes_max }}</td>
            <td>
              <button @click="supprimerTournoi(tournoi.id)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import { db, storage } from "../../firebase/firebase";
  import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
  import { ref, getDownloadURL, listAll } from "firebase/storage";
  
  export default {
    name: 'ListeTournois',
    data() {
      return {
        tournois: [],
      }
    },
    async mounted() {
      await this.fetchTournois();
    },
    methods: {
      async fetchTournois() {
        const tournoisRef = collection(db, 'tournois');
        const snapshot = await getDocs(tournoisRef);
        this.tournois = await Promise.all(snapshot.docs.map(async doc => {
          const tournoiData = doc.data();
          const imagesRef = ref(storage, `tournois/${tournoiData.nomstade}/${tournoiData.nom_tournoi}`);
          const imagesList = await listAll(imagesRef);
          const logoUrl = await getDownloadURL(imagesList.items[0]); // Prendre le premier logo
          return { id: doc.id, logoUrl, ...tournoiData };
        }));
      },
      async supprimerTournoi(tournoiId) {
        const confirmation = confirm("Êtes-vous sûr de vouloir supprimer ce tournoi ?");
        if (confirmation) {
          try {
            await deleteDoc(doc(db, 'tournois', tournoiId));
            await this.fetchTournois();
            console.log("Tournoi supprimé avec succès !");
          } catch (error) {
            console.error("Erreur lors de la suppression du tournoi :", error);
          }
        }
      },
    }
  }
  </script>
  
  <style scoped>
  /* Ajoutez votre CSS personnalisé ici */
  table {
    width: 100%;
    border-collapse: collapse;
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
  
  button {
    padding: 5px 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>
  