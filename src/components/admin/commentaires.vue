<template>
    <div>
      <h2>Liste des Commentaires</h2>
      <table>
        <thead>
          <tr>
            <th>Nom du Stade</th>
            <th>Commentaire</th>
            <th>Nom de l'Équipe</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(comment, index) in comments" :key="index">
            <td>{{ comment.nomstade }}</td>
            <td>{{ comment.comment }}</td>
            <td>{{ comment.nomequipe }}</td>
            <td>
              <button @click="confirmDelete(comment)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import Swal from 'sweetalert2';
  import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
  import { db } from '../../firebase/firebase'; // Importez votre configuration Firebase
  
  export default {
    data() {
      return {
        comments: [],
      };
    },
    mounted() {
      this.fetchComments();
    },
    methods: {
      async fetchComments() {
        try {
          const querySnapshot = await getDocs(collection(db, 'comments'));
          querySnapshot.forEach((doc) => {
            this.comments.push({ id: doc.id, ...doc.data() });
          });
        } catch (error) {
          console.error('Erreur lors de la récupération des commentaires : ', error);
        }
      },
      async deleteComment(comment) {
        try {
          await deleteDoc(doc(db, 'comments', comment.id));
          // Mettre à jour localement la liste des commentaires après la suppression
          this.comments = this.comments.filter((c) => c.id !== comment.id);
          Swal.fire('Commentaire supprimé', '', 'success');
        } catch (error) {
          console.error('Erreur lors de la suppression du commentaire : ', error);
        }
      },
      async confirmDelete(comment) {
        Swal.fire({
          title: 'Êtes-vous sûr ?',
          text: 'Vous ne pourrez pas annuler cette action !',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Oui, supprimer !',
          cancelButtonText: 'Annuler',
        }).then((result) => {
          if (result.isConfirmed) {
            this.deleteComment(comment);
          }
        });
      },
    },
  };
  </script>
  
  <style scoped>
  /* Style pour votre tableau si nécessaire */
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
  </style>
  