<template>
    <div class="demandes-container">
      <h2>Liste des demandes de recrutement</h2><br>
      <div v-if="demandes.length === 0" class="empty-message">
        Aucune demande de recrutement pour le moment.
      </div>
      <div v-else>
        <table class="demandes-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Non d'equipe</th>
              <th>Âge du joueur</th>
              <th>Poste</th>
              <th>Niveau</th>
              <th>Ville</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="demande in demandes" :key="demande.id">
              <td><img :src=demande.logo></td>
              <td>{{ demande.equipename }}</td>
              <td>{{ demande.ageMin }} - {{ demande.ageMax }}</td>
              <td>{{ demande.poste }}</td>
              <td>{{ demande.niveau }}</td>
              <td>{{ demande.ville }}</td>
              <td>{{ demande.numero }}</td>
              <td>{{ demande.email }}</td>
              <td>
                <button @click="supprimerDemande(demande.id)" class="delete-button">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import { db } from "../../firebase/firebase";
  import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
  import Swal from 'sweetalert2';
  
  export default {
    name: 'RecruitmentForm',
    data() {
      return {
        storedEmail: '',
        demandes: [],
      }
    },
    async mounted() {
      this.fetchDemandesRecrutement();
    },
    methods: {
      async fetchDemandesRecrutement() {
        try {
          const querySnapshot = await getDocs(collection(db, "recrutement"));
          querySnapshot.forEach(doc => {
            this.demandes.push({ id: doc.id, ...doc.data() });
          });
        } catch (error) {
          console.error("Erreur lors de la récupération des recrutements :", error);
        }
      },
  
      async supprimerDemande(demandeId) {
        try {
          await deleteDoc(doc(db, "recrutement", demandeId));
          this.demandes = this.demandes.filter(demande => demande.id !== demandeId);
          Swal.fire('Demande supprimée!', 'La demande de recrutement a été supprimée avec succès.', 'success');
        } catch (error) {
          console.error("Erreur lors de la suppression de la demande de recrutement :", error);
          Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression de la demande de recrutement.', 'error');
        }
      },
    }
  }
  </script>
  
  <style scoped>
  img{
    max-width: 100px;
  }
  .demandes-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .demandes-table th,
  .demandes-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  .demandes-table th {
    background-color: #f2f2f2;
  }
  
  .delete-button {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 3px;
  }
  
  .delete-button:hover {
    background-color: #d32f2f;
  }
  </style>
  