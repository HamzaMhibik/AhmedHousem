<template>
    <div class="container">
      <div v-if="tournoi" class="details-container">
        <center>
          <h1 class="title">{{ tournoi.nom_tournoi }}</h1>
          <img :src="logoUrl" alt="Logo du tournoi" class="logo">
        </center>
        <center>
            <h2>Détails du Tournoi:</h2>
            <table>
            <tr>
                <td><p><strong>Nom de stade:</strong>{{ tournoi.nomstade }}</p></td>
                <td class="tdd"><p><strong>Date de début:</strong> {{ tournoi.date_debut }}</p></td>
            </tr>
            <tr>
                <td><p><strong>Date de fin:</strong> {{ tournoi.date_fin }}</p></td>
                <td class="tdd"><p><strong>Catégorie:</strong> {{ tournoi.categorie }}</p></td>
            </tr>
            <tr>
                <td><p><strong>Description:</strong> {{ tournoi.description }}</p></td>
                <td class="tdd"><p><strong>Email:</strong> {{ tournoi.email }}</p></td>
            </tr>
            <tr>
                <td><p><strong>Frais d'inscription:</strong> {{ tournoi.frais_inscription }} Dt</p></td>
                <td class="tdd"><p><strong>Recompense:</strong> {{ tournoi.recompense }}</p></td>
            </tr>
            <tr>
                <td><p><strong>Nombre maximum:</strong><br> {{ tournoi.nb_equipes_max }} equipes</p></td>
                <td class="tdd"><p><strong>Conditions spéciales:</strong> {{ tournoi.conditions_speciales }}</p></td>
            </tr>
            </table>
    </center>
      <center>
        <div v-if="tournoi.equipes.length < tournoi.nb_equipes_max">
          <button @click="ajouteequipe" v-if="!isDateDebutPasse" class="participer-btn">Ajouter une équipe</button>
        </div>
      </center>
      <h2 v-if="tournoi.equipes.length === tournoi.nb_equipes_max" class="nbmax">Nombre maximum d'équipes atteint</h2>
      <h4>Équipes enregistrées :</h4>
      <div v-if="tournoi.equipes && tournoi.equipes.length > 0" class="equipes-container">
        <div class="equipe-card" v-for="(equipe, index) in tournoi.equipes" :key="index">
          <h3>Équipe N{{ index + 1 }}:</h3>
          <p><strong>{{ equipe }}</strong> </p>
          <button v-if="!isDateDebutPasse" @click="supprimerEquipe(index)" class="delete-btn">Supprimer</button>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Chargement...</p>
    </div>
  </div>
</template>
<style scoped>
  .title {
    font-size: 2rem;
  }
  
  * {
    font-size: 1.25rem;
  }
  
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  td {
    padding: 10px;
  }
  
  .tdd {
    border-left: solid 1px black;
  }
  
  .logo {
    max-width: 200px;
    border-radius: 50%;
  }
  
  .details-container {
    margin-top: 20px;
    border: 1px solid #ccc;
    padding: 20px;
  }
  
  .stade {
    cursor: pointer;
    color: blue;
    text-decoration: underline;
  }
  
  .participer-btn {
    background-color: green;
    color: white;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    margin-top: 10px;
  }
  
  .nbmax {
    color: red;
  }
  
  .equipes-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-gap: 20px;
    margin-top: 20px;
  }
  
  .equipe-card {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .delete-btn {
    background-color: red;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
  }
  
  .delete-btn:hover {
    background-color: darkred;
  }
  </style>
    <script>
    import { db, storage,auth } from "../../firebase/firebase";
    import { doc, getDoc, updateDoc } from 'firebase/firestore';
    import { ref, getDownloadURL } from "firebase/storage";
    import Swal from 'sweetalert2'
  
    export default {
      data() {
        return {
          idTournoi: '',
          tournoi: null,
          logoUrl: null,
          storedEmail: '',
          equipe: '',
          user: null,
          unsubscribe: null,
          usertype:null,
          verifie:null
        }
      },
      async created() {
    this.idTournoi = this.$route.query.id;
    await this.getTournoi();
  },
  computed: {
    userDetails() {
      return this.$store.state.userDetails;
    },
    isDateDebutPasse() {
      // Vérifier si la date de début est passée
      if (this.tournoi) {
        const dateDebut = new Date(this.tournoi.date_debut);
        const currentDate = new Date();
        return currentDate > dateDebut;
      }
      return false;
    }
  },
  async mounted() {
    await this.$store.dispatch('fetchUserDetails');
    this.storedEmail = this.userDetails?.email ?? '';
    this.usertype = this.userDetails?.photoURL ?? '';
    this.verifie = this.userDetails?.emailVerified ?? '';
    this.unsubscribe = auth.onAuthStateChanged(user => {this.user = user;
      if (!user) {this.$router.push('/');}
      if(this.usertype!=='proprietaire'){Swal.fire('Cree un compte proprietaire pour accede a cette page');this.$router.push('/');}
      if(!this.verifie){Swal.fire('Vous devez verifie votre email avant pour accede a cette page5');this.$router.push('/vericationemail');}
    });
    await this.$store.dispatch('fetchUserDetails');
    this.storedEmail = this.userDetails?.email ?? '';
  },
      methods: {
        async getTournoi() {
          try {
            const docRef = doc(db, 'tournois', this.idTournoi);
            const docSnap = await getDoc(docRef);
  
            if (docSnap.exists()) {
              this.tournoi = docSnap.data();
              await this.getLogoUrl(this.tournoi.nom_tournoi, this.tournoi.nomstade);
            } else {
              console.log('Aucun document trouvé !');
            }
          } catch (error) {
            console.error('Erreur lors de la récupération du tournoi:', error);
          }
        },
        async getLogoUrl(nomTournoi, nomStade) {
          try {
            const storageRef = ref(storage, `tournois/${nomStade}/${nomTournoi}/image1.png`); // Update the path to match the actual path in Firebase Storage
            this.logoUrl = await getDownloadURL(storageRef);
          } catch (error) {
            console.error('Erreur lors de la récupération de l\'URL du logo:', error);
          }
        },
        async ajouteequipe() {
          const docRef = doc(db, 'tournois', this.idTournoi);
          const docSnap = await getDoc(docRef);
          const { value: equipe } = await Swal.fire({
            confirmButtonText: "Enregistrer",
            showCancelButton: true,
            title: "Enregistrer une équipe",
            input: "text",
            inputLabel: "Entrez le nom de l'équipe à ajouter",
            inputPlaceholder: "nom de l'équipe"
          });
          if (equipe) {
            const tournoiData = docSnap.data();
            const equipesExistantes = tournoiData.equipes || [];
            // Ajouter le nom de l'équipe à la liste existante d'équipes du tournoi
            equipesExistantes.push(equipe);
            // Mettre à jour le document 'tournoi' dans la base de données avec la nouvelle liste d'équipes
            await updateDoc(docRef, { equipes: equipesExistantes });
            // Réassigner tournoi.equipes pour déclencher la mise à jour de l'affichage
            this.tournoi.equipes = equipesExistantes;
            Swal.fire(`${equipe} ajouté avec succès`);
            Swal.fire("Participation effectuée", "", "success");
          } else {
            Swal.fire("Participation annulée", "", "info");
          }
        },
        async supprimerEquipe(index) {
          const equipeSupprimee = this.tournoi.equipes.splice(index, 1)[0];
          const docRef = doc(db, 'tournois', this.idTournoi);
          await updateDoc(docRef, { equipes: this.tournoi.equipes });
          Swal.fire(`${equipeSupprimee} supprimée avec succès`);
        }
      }
    }
  </script>
  