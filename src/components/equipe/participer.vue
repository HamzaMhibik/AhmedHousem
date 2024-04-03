<template>
  <div class="container">
    <div v-if="tournoi" class="details-container">
      <center>
        <h1 class="title">{{ tournoi.nom_tournoi }}</h1>
        <img :src="logoUrl" alt="Logo du tournoi" class="logo">
      </center>
      <h2>Détails du Tournoi:</h2>  
      <table>
        <tr>
          <td><p><strong>Nom de stade:</strong> <span class="stade" @click="voir()">{{ tournoi.nomstade }}</span></p></td>
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
      <center><button @click="participer" v-if="tournoi.equipes.length<tournoi.nb_equipes_max" class="participer-btn">Participer</button></center>
      <h2 v-if="tournoi.equipes.length === tournoi.nb_equipes_max" class="nbmax">Nombre max des équipes atteint</h2>
      <h4>Équipes enregistrées :</h4>
      <div v-if="tournoi.equipes && tournoi.equipes.length > 0" class="equipes-container">
        <div class="equipes-column">
          <ul>
            <li v-for="(equipe, index) in tournoi.equipes.slice(0, Math.ceil(tournoi.equipes.length / 2))" :key="index">
              Équipe N{{ index + 1 }}: <strong>{{ equipe }}</strong>
            </li>
          </ul>
        </div>
        <div class="equipes-column">
          <ul>
            <li v-for="(equipe, index) in tournoi.equipes.slice(Math.ceil(tournoi.equipes.length / 2))" :key="index">
              Équipe N{{tournoi.equipes.length}}: <strong>{{ equipe }}</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Chargement...</p>
    </div>
  </div>
</template>
<style scoped>
.title{
  font-size: 2rem;
}
*{
  font-size: 1.25rem;
}
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
td{
  padding: 10px;
}
.tdd{
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
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.equipes-column {
  flex: 1;
}

.equipes-column ul {
  list-style-type: none;
  padding: 0;
}

.equipes-column ul li {
  margin-bottom: 10px;
}


</style>
<script>
import { db, storage,auth } from "../../firebase/firebase";
import { doc, getDoc,query,collection,where,getDocs,updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from "firebase/storage";
import Swal from 'sweetalert2'

export default {
  data() {
    return {
      idTournoi: '',
      tournoi: null,
      logoUrl: null,
      storedEmail:'',
      equipe:'',
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
  },
  async mounted(){
    await this.$store.dispatch('fetchUserDetails');
    this.storedEmail = this.userDetails?.email ?? '';
    this.usertype = this.userDetails?.photoURL ?? '';
    this.verifie = this.userDetails?.emailVerified ?? '';
    this.unsubscribe = auth.onAuthStateChanged(user => {this.user = user;
      if(this.usertype!=='equipe'){Swal.fire('Cree un compte equipe pour accede a cette page');this.$router.push('/');}
      if(!this.verifie){Swal.fire('Valider votre email pour accede a cette page');this.$router.push('/vericationemail');}

    });
    this.fetchEquipeByEmail(this.storedEmail)
  },
  methods: {
    voir() {
      this.$router.push({ path: 'reserver', query: { stade: this.tournoi.email } });
    },
    async fetchEquipeByEmail(storedEmail) {
      try {
        const q = query(collection(db, "equipes"), where("email", "==", storedEmail));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async doc => {
          this.equipe = {...doc.data(), id: doc.id}; // Ajouter l'ID du document
        });
      } catch (error) {
        console.error("Erreur lors de la récupération de l'équipe : ", error);
      }
    },
    async getTournoi() {
      try {
        const docRef = doc(db, 'tournois', this.idTournoi);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            this.tournoi = docSnap.data();
            await this.getLogoUrl(this.tournoi.nom_tournoi,this.tournoi.nomstade);
        } else {
            console.log('Aucun document trouvé !');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du tournoi:', error);
      }
    },
    async getLogoUrl(nomTournoi,nomStade) {
  try {
    const storageRef = ref(storage, `tournois/${nomStade}/${nomTournoi}/image1.png`); // Update the path to match the actual path in Firebase Storage
    this.logoUrl = await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL du logo:', error);
  }
},
async participer() {
  try {
    // Récupérer le document tournoi
    const docRef = doc(db, 'tournois', this.idTournoi);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const tournoiData = docSnap.data();

      // Vérifier si le nom de l'équipe est déjà enregistré dans le tournoi
      if (tournoiData.equipes && tournoiData.equipes.includes(this.equipe.nomEquipe)) {
        Swal.fire({
          title: "Enregistré",
          text: "Votre équipe est déjà enregistrée dans ce tournoi.",
          icon: "success"
        });
        console.log("Votre équipe est déjà enregistrée dans ce tournoi.");
      } else {
        Swal.fire({
          title: "Participer a cette tournoi ?",
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: "Oui",
          denyButtonText: `Non`
        }).then((result) => {
          if (result.isConfirmed) {
            const equipesExistantes = tournoiData.equipes || [];

        // Ajouter le nom de l'équipe à la liste existante d'équipes du tournoi
        equipesExistantes.push(this.equipe.nomEquipe);

        // Mettre à jour le document 'tournoi' dans la base de données avec la nouvelle liste d'équipes
        updateDoc(docRef, { equipes: equipesExistantes });

        // Réassigner tournoi.equipes pour déclencher la mise à jour de l'affichage
        this.tournoi.equipes = equipesExistantes;

        console.log("Équipe ajoutée avec succès au tournoi.");
            Swal.fire("Participation effectué", "", "success");
          } else if (result.isDenied) {
            Swal.fire("Participation annulé", "", "info");
          }
        });
        // Récupérer la liste existante d'équipes ou initialiser une nouvelle liste si elle n'existe pas encore
        
      }
    } else {
      console.log('Le document tournoi n\'existe pas.');
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'équipe au tournoi :", error);
  }
}

  }
}
</script>
