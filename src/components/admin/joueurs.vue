<template>
    <div class="container">
      <h1>Liste des Joueurs Enregistrés</h1>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Âge</th>
            <th>Téléphone</th>
            <th>Ville</th>
            <th>Poste</th>
            <th>Niveau</th>
            <th>Photo</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(joueur, index) in joueurs" :key="index">
            <td>{{ joueur.nom }}</td>
            <td>{{ joueur.age }}</td>
            <td>{{ joueur.telephone }}</td>
            <td>{{ joueur.ville }}</td>
            <td>{{ joueur.poste }}</td>
            <td>{{ joueur.niveau }}</td>
            <td><img :src="joueur.logoUrl" alt="Photo du joueur" style="max-width: 100px; max-height: 100px;"></td>
            <td><button @click="deleteJoueur(joueur.id)">Supprimer</button></td>
          </tr>
        </tbody>
      </table>
      <div v-if="joueurs.length === 0">Aucun joueur trouvé.</div>
    </div>
  </template>
  
  <script>
    import { db, storage } from "../../firebase/firebase";
    import { collection, getDocs, doc } from 'firebase/firestore';
    import { ref, getDownloadURL } from "firebase/storage";
  
  export default {
    data() {
      return {
        joueurs: []
      }
    },
    async mounted() {
      await this.fetchJoueurs();
    },
    methods: {
        async fetchJoueurs() {
    try {
      const joueursRef = collection(db, 'joueures');
      const querySnapshot = await getDocs(joueursRef);
      this.joueurs = [];
      querySnapshot.forEach(async (doc) => {
        const joueurData = doc.data();
        const storageRef = ref(storage, `joueurs/${joueurData.nom}/photo`);
        const logoUrl = await getDownloadURL(storageRef);
        this.joueurs.push({ id: doc.id, ...joueurData, logoUrl: logoUrl });
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des joueurs : ', error);
    }
  },
  async deleteJoueur(joueurId) {
      try {
        // Supprimer le joueur de la base de données
        await deleteDoc(doc(db, 'joueurs', joueurId));

        // Supprimer la photo du joueur du stockage
        const imageRef = ref(storage, `joueurs/${joueurId}/photo`);
        await deleteObject(imageRef);

        // Mettre à jour localement la liste des joueurs après la suppression
        this.joueurs = this.joueurs.filter(joueur => joueur.id !== joueurId);

        // Afficher une notification de succès
        Swal.fire('Joueur supprimé avec succès', '', 'success');
      } catch (error) {
        console.error('Erreur lors de la suppression du joueur : ', error);
        // Afficher une notification d'erreur
        Swal.fire('Erreur lors de la suppression du joueur', '', 'error');
      }
    }
    }
  }
  </script>
  
  <style scoped>
  .container {
  margin-top: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
tr:hover {
  background-color: #f2f2f2;
}
  </style>
  