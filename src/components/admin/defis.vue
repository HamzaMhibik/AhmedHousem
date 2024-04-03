<template>
    <div>
      <h2>Liste des Défis</h2>
      <table>
        <thead>
          <tr>
            <th>Équipe 1</th>
            <th>Équipe 2</th>
            <th>Stade</th>
            <th>Date du Match</th>
            <th>Heure du Match</th>
            <th>État</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(defi, index) in defis" :key="index">
            <td>{{ defi.equipe1 }}</td>
            <td>{{ defi.equipe2 }}</td>
            <td>{{ defi.stade }}</td>
            <td>{{ defi.dateMatch }}</td>
            <td>{{ defi.heureMatch }}</td>
            <td>{{ defi.etat }}</td>
            <td>
              <button @click="supprimerDefi(defi.id, index)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import { db } from "../../firebase/firebase";
  import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
  
  export default {
    data() {
      return {
        defis: [], // Liste des défis
      }
    },
    async mounted() {
      await this.fetchDefis(); // Récupérer la liste des défis lors du montage du composant
    },
    methods: {
      async fetchDefis() {
        try {
          const querySnapshot = await getDocs(collection(db, "defis"));
          this.defis = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error("Erreur lors de la récupération des défis :", error);
        }
      },
      async supprimerDefi(defiId, index) {
        // Logique pour supprimer un défi
        try {
          await deleteDoc(doc(db, 'defis', defiId));
          this.defis.splice(index, 1); // Supprimer le défi de la liste locale
          console.log("Défi supprimé avec succès !");
        } catch (error) {
          console.error("Erreur lors de la suppression du défi :", error);
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
  