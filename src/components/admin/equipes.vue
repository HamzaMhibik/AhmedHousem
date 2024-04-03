<template>
    <div>
      <h2>Liste des Équipes Enregistrées</h2>
      <div v-for="equipe in equipes" :key="equipe.id" class="equipe-item">
        <div class="equipe-info">
          <img :src="equipe.logoURL" alt="Logo de l'équipe" class="logo-equipe">
          <div class="details-equipe">
            <h3>{{ equipe.nomEquipe }}</h3>
            <p><strong>Capitaine:</strong> {{ equipe.nomCapitaine }}</p>
            <p><strong>Email:</strong> {{ equipe.email }}</p>
            <p><strong>Ville:</strong> {{ equipe.ville }}</p>
            <p><strong>Téléphone:</strong> {{ equipe.telephone }}</p>
            <p><strong>Joueurs:</strong></p>
            <ul class="joueurs-liste">
              <li v-for="joueur in equipe.joueurs" :key="joueur">{{ joueur }}</li>
            </ul>
          </div>
        </div>
        <div class="actions">
          <button @click="confirmDelete(equipe)">Supprimer</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { db, storage } from '../../firebase/firebase';
  import { deleteDoc, doc, collection, getDocs } from 'firebase/firestore';
  import { ref, deleteObject, getDownloadURL } from "firebase/storage";
  import Swal from 'sweetalert2';
  
  export default {
    name: 'EquipeList',
    data() {
      return {
        equipes: [],
      };
    },
    async created() {
      await this.fetchEquipes();
    },
    methods: {
      async fetchEquipes() {
        try {
          const querySnapshot = await getDocs(collection(db, 'equipes'));
          querySnapshot.forEach(async (doc) => {
            const equipeData = doc.data();
            const imageRef = ref(storage, `logos/${equipeData.nomEquipe}`);
            const imageUrl = await getDownloadURL(imageRef);
            this.equipes.push({ id: doc.id, ...equipeData, logoURL: imageUrl });
          });
        } catch (error) {
          console.error('Erreur lors de la récupération des équipes : ', error);
        }
      },
      async deleteEquipe(equipe) {
        try {
          await deleteDoc(doc(db, 'equipes', equipe.id));
          const imageRef = ref(storage, `logos/${equipe.nomEquipe}`);
          await deleteObject(imageRef);
          this.equipes = this.equipes.filter((e) => e.id !== equipe.id);
          Swal.fire('Équipe supprimée', '', 'success');
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'équipe : ', error);
        }
      },
      async confirmDelete(equipe) {
        Swal.fire({
          title: 'Êtes-vous sûr ?',
          text: "Vous ne pourrez pas annuler cette action !",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Oui, supprimer !',
          cancelButtonText: 'Annuler'
        }).then((result) => {
          if (result.isConfirmed) {
            this.deleteEquipe(equipe);
          }
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .equipe-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid #ccc;
  }
  
  .logo-equipe {
    max-width: 100px;
    max-height: 100px;
    margin-right: 20px;
  }
  
  .details-equipe {
    flex: 1;
  }
  
  .joueurs-liste {
    margin-top: 0;
    padding-left: 20px;
  }
  
  .actions {
    margin-left: 20px;
  }
  </style>
  