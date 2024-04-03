<template>
  <div class="demandes-container">
    <button @click="defier()">Créer une demande de recrutement</button><br><br>
    <h2>Liste des demandes de recrutement</h2><br>
    <div v-if="demandes.length === 0" class="empty-message">
      Aucune demande de recrutement pour le moment.
    </div>
    <div v-else>
      <div v-for="demande in demandes" :key="demande.id" class="demande-card">
        <div class="demande-info">
          <p><strong>Âge du joueur:</strong> {{ demande.ageMin }} - {{ demande.ageMax }}</p>
          <p><strong>Poste:</strong> {{ demande.poste }}</p>
          <p><strong>Niveau:</strong> {{ demande.niveau }}</p>
          <p><strong>Ville:</strong> {{ demande.ville }}</p>
          <p><strong>Téléphone:</strong> {{ demande.numero }}</p>
          <p><strong>Email:</strong> {{ demande.email }}</p>
        </div>
        <div class="joueurs-liste">
          <strong>Listes de joueurs qui ont postulé:</strong>
          <table v-if="demande.joueurs && demande.joueurs.length > 0" class="joueurs-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Ville</th>
                <th>Poste</th>
                <th>Âge</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="joueur in demande.joueurs" :key="joueur.id">
                <td><img :src="joueur.photoUrl" alt="image de joueur"></td>
                <td>{{ joueur.nom }}</td>
                <td>{{ joueur.prenom }}</td>
                <td>{{ joueur.telephone }}</td>
                <td>{{ joueur.email }}</td>
                <td>{{ joueur.ville }}</td>
                <td>{{ joueur.poste }}</td>
                <td>{{ joueur.age }}</td>
                <td>
                  <button @click="supprimerJoueur(demande.id, joueur.id)" class="delete-button">Supprimer ce joueur</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="no-applicants">Aucun joueur n'a postulé pour cette demande.</p>
        </div><center><button @click="supprimerDemande(demande.id)" class="delete-button">Supprimer la demande</button></center></div>
    </div>
  </div>
</template>

<script>
import { db,auth } from "../../firebase/firebase";
import { collection, getDocs, deleteDoc, doc, where, query,updateDoc,arrayRemove } from 'firebase/firestore';
import Swal from 'sweetalert2'

export default {
  name: 'RecruitmentForm',
  data() {
    return {
      storedEmail: '',
      demandes: [],
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
  },
  async mounted() {
    await this.$store.dispatch('fetchUserDetails');
    this.storedEmail = this.userDetails?.email ?? '';
    this.usertype = this.userDetails?.photoURL ?? '';
    this.verifie = this.userDetails?.emailVerified ?? '';
    this.unsubscribe = auth.onAuthStateChanged(user => {this.user = user;
        if(this.usertype!=='equipe'){Swal.fire('Cree un compte equipe pour accede a cette page');this.$router.push('');}
        if(!this.verifie){Swal.fire('Valider votre email pour accede a cette page');this.$router.push('/vericationemail');}

    });
    this.fetchDemandesRecrutement();
  },
  methods: {
    async fetchDemandesRecrutement() {
      try {
        const q = query(collection(db, "recrutement"), where("email", "==", this.storedEmail));
        const querySnapshot = await getDocs(q);
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
    defier(){
      this.$router.push('/recrutement')
    },
    async supprimerJoueur(demandeId, joueurId) {
    try {
      // Supprimer le joueur de la demande de recrutement dans la base de données
      const demandeRef = doc(db, "recrutement", demandeId);
      await updateDoc(demandeRef, {
        joueurs: arrayRemove(joueurId)
      });

      // Mettre à jour localement la liste des joueurs de la demande
      const demandeIndex = this.demandes.findIndex(demande => demande.id === demandeId);
      if (demandeIndex !== -1) {
        this.demandes[demandeIndex].joueurs = this.demandes[demandeIndex].joueurs.filter(joueur => joueur.id !== joueurId);
      }

      // Afficher un message de confirmation
      Swal.fire('Joueur supprimé!', 'Le joueur a été supprimé avec succès de cette demande de recrutement.', 'success');
    } catch (error) {
      console.error("Erreur lors de la suppression du joueur :", error);
      Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression du joueur.', 'error');
    }
  },
  }
}
</script>

<style scoped>
  .demandes-container {
    font-family: Arial, sans-serif;
    margin: 20px;
  }

  .empty-message {
    padding: 10px;
    background-color: #f2f2f2;
    border-radius: 5px;
  }

  .demande-card {
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .demande-info p {
    margin: 5px 0;
  }

  .joueurs-table {
    width: 100%;
    border-collapse: collapse;
  }

  .joueurs-table th,
  .joueurs-table td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  .no-applicants {
    margin-top: 10px;
    color: #888;
  }

  .delete-button {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .delete-button:hover {
    background-color: #d32f2f;
  }
  img{
    max-width: 100px;
  }
  button{
    background-color: #3682f4;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
</style>