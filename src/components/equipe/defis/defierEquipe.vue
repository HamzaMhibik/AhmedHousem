<template>
  <div class="defis"><center>
    <router-link to="/defispropose" class="link">Defis proposé</router-link> 
    <router-link to="/defiscree" class="link">Defis créé</router-link>
    <router-link to="/defierEquipe" class="link">Defier un Equipe</router-link>
  </center>
  </div><br>
  <center><h1 class="title">Defier un Equipe</h1></center>
    <div class="container">
      <form @submit.prevent="enregistreDefie" class="form">
        <div>
          <label for="ville">Choisir une ville :</label>
          <select id="ville" v-model="selectedCity" @change="filterTeamsAndStadiums" class="form-control" required>
              <option value="">Sélectionner une ville</option>
              <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>
          
        <div class="form-group">
          <label for="equipe2">Choisir l'équipe à défier :</label>
          <select id="equipe2" v-model="equipe2" class="form-control" required>
<!--             <option value="">Sélectionner une équipe</option>-->
            <option v-for="equipe in equipes" :key="equipe.id" :value="equipe.nomEquipe">{{ equipe.nomEquipe }}</option>
          </select>
        </div>
  
        <div class="form-group">
          <label for="stade">Choisir le stade :</label>
          <select id="stade" v-model="stade" class="form-control" required> 
            <option value="">Sélectionner un stade</option>
            <option v-for="stade in stades" :key="stade.id" :value="stade.stadiumName">{{ stade.stadiumName }}</option>
          </select>
        </div>
  
        <div class="form-group">
  <label for="date">Date du match :</label>
  <select v-model="date" class="form-control" required>
    <option value="">Sélectionner une date</option>
    <option v-for="option,index in generateDates()" :key="option.value" :value="option.value+'_'+index">{{ option.text }}</option>
  </select>
</div>

        <div class="form-group">
          <label for="date">heure du match :</label>
          <select v-model="time" class="time">
            <option value="">Choisir l'heure de match</option>
            <option value="16:00 - 17:00">16:00 - 17:00</option>
            <option value="17:00 - 18:00">17:00 - 18:00</option>
            <option value="18:00 - 19:00">18:00 - 19:00</option>
            <option value="19:00 - 20:00">19:00 - 20:00</option>
            <option value="20:00 - 21:00">20:00 - 21:00</option>
            <option value="21:00 - 22:00">21:00 - 22:00</option>
            <option value="22:00 - 23:00">22:00 - 23:00</option>
            <option value="23:00 - 00:00">23:00 - 00:00</option>
          </select>
        </div>
  
        <div class="form-group">
          <label for="message">Message :</label>
          <textarea id="message" cols="30" rows="5" v-model="message" class="form-control" placeholder="laisser un message pour l'equipe adversair"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Défier</button>
      </form>
    </div>
  </template>
    <script>
    import { db,auth } from "../../../firebase/firebase";
    import { query,collection,where,getDocs,addDoc } from 'firebase/firestore';
    import Swal from 'sweetalert2';

    export default {
      data() {
        return {
        storedEmail: '',
        selectedCity: '',
        cities: ['zarzis', 'mednine', 'jerba','gabes','sfax'], // Liste des villes disponibles
        allTeams: [], // Toutes les équipes
        allStadiums: [], // Tous les stades
        equipes: [], // Équipes filtrées par la ville sélectionnée
        stades: [],
        equipe1: '',
        equipe2: '', // Initialiser avec la valeur par défaut
        stade: '',
        message: '',
        date: '',
        time: '',
        today: '',
        futureDate: '',
        week: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
        user: null,
        unsubscribe: null,
        usertype:null,
        verifie:null


    }
      },
      created() {
        this.equipe2 = this.$route.query.nomEquipe;
        this.selectedCity=this.$route.query.ville;
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
          if(this.usertype!=='equipe'){Swal.fire('Cree un compte equipe pour accede a cette page');this.$router.push('/');}
          if(!this.verifie){Swal.fire('Valider votre email pour accede a cette page');this.$router.push('/vericationemail');}
        });
        this.fetchEquipeByEmail(this.storedEmail);
        this.fetchStades();
        this.fetchEquipes(); // Assurez-vous que cette méthode est appelée pour peupler la liste des équipes
    },
      methods: {
        async fetchEquipeByEmail(storedEmail) {
          try {
            const q = query(collection(db, "equipes"), where("email", "==", storedEmail));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async doc => {
              this.equipe1 = { ...doc.data(), id: doc.id }; // Ajouter l'ID du document
            });
            this.equipesLoaded = true; // Set equipesLoaded flag to true
          } catch (error) {
            console.error("Erreur lors de la récupération de l'équipe : ", error);
          }
        },
        async fetchEquipes() {
          try {
            const querySnapshot = await getDocs(collection(db, "equipes"));
            querySnapshot.forEach(doc => {
              this.equipes.push({ ...doc.data(), id: doc.id });
            });
          } catch (error) {
            console.error("Erreur lors de la récupération des équipes : ", error);
          }
        },
        async fetchStades() {
          try {
            const querySnapshot = await getDocs(collection(db, "proprietaire"));
            querySnapshot.forEach(doc => {
              this.stades.push({ ...doc.data(), id: doc.id });
            });
          } catch (error) {
            console.error("Erreur lors de la récupération des stades : ", error);
          }
        },
        async enregistreDefie() {
    // Vérifier si la date et l'heure ont été sélectionnées
    if (!this.date || !this.time) {
        Swal.fire("Veuillez sélectionner la date et l'heure du match.", "", "error");
        return;
    }

    // Vérifier si le créneau est disponible
    const selectedDateTime = `${this.date.split('_')[0]}_${this.time}`;
    const stade = this.stades.find(stade => stade.stadiumName === this.stade);

    if (!stade) {
        Swal.fire("Stade non trouvé.", "", "error");
        return;
    }
    Swal.fire({
      title: `Defier ${this.equipe2} ?`,
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Defier",
    }).then(async(result) => {
      if (result.isConfirmed) {
        try {
        const emploiDuTemps = stade.emploiDuTemps1[this.week[parseInt(this.date.split('_')[1])]][this.time];
        if (emploiDuTemps === 'vide') {
            // Créneau disponible, enregistrer le défi
            const data = {
                equipe1: this.equipe1.nomEquipe,
                equipe2: this.equipe2,
                stade: this.stade,
                dateMatch: this.date.split('_')[0],
                index: parseInt(this.date.split('_')[1]),
                heureMatch: this.time,
                message: this.message,
                etat: 'en attent'
            };
            const docRef = await addDoc(collection(db, "defis"), data);
            this.equipe2 = '';
            this.stade = '';
            this.date = '';
            this.time = '';
            this.message = '';
            Swal.fire("Défi envoyé", "", "success");
            this.$router.push('/defierEquipe');
        } else {
            // Créneau non disponible
            Swal.fire("Le créneau sélectionné n'est pas disponible.", "", "error");
        }
    } catch (error) {
        console.error("Erreur lors de la vérification du créneau horaire:", error);
        Swal.fire("Une erreur s'est produite. Veuillez réessayer.", "", "error");
    }
        Swal.fire("Saved!", "", "success");
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
      }
    });
    
}
,
      generateDates() {
          const dates = [];
          const today = new Date(); // Obtenez la date d'aujourd'hui
          for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i); // Ajoutez i jours à la date d'aujourd'hui
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = date.toLocaleDateString('fr-FR', options); // Formattez la date
            dates.push({ value: `${formattedDate}_${i}`, text: formattedDate }); // Ajoutez la date au tableau
          }
          return dates;
          },
          filterTeamsAndStadiums() {
    // Réinitialiser les listes d'équipes et de stades
    this.equipes = [];
    this.stades = [];

    // Filtrer les équipes et les stades en fonction de la ville sélectionnée
    const filteredTeams = this.allTeams.filter(team => team.ville === this.selectedCity);
    const filteredStadiums = this.allStadiums.filter(stadium => stadium.ville === this.selectedCity);

    // Mettre à jour les listes d'équipes et de stades
    this.equipes = filteredTeams;
    this.stades = filteredStadiums;
},async fetchEquipes() {
    try {
        const querySnapshot = await getDocs(collection(db, "equipes"));
        querySnapshot.forEach(doc => {
            this.allTeams.push({ ...doc.data(), id: doc.id });
        });
        // Mettre à jour les équipes en fonction de la ville sélectionnée
        this.filterTeamsAndStadiums();
    } catch (error) {
        console.error("Erreur lors de la récupération des équipes : ", error);
    }
},

async fetchStades() {
    try {
        const querySnapshot = await getDocs(collection(db, "proprietaire"));
        querySnapshot.forEach(doc => {
            this.allStadiums.push({ ...doc.data(), id: doc.id });
        });
        // Mettre à jour les stades en fonction de la ville sélectionnée
        this.filterTeamsAndStadiums();
    } catch (error) {
        console.error("Erreur lors de la récupération des stades : ", error);
    }
},

        }
      }
    
</script> 
<style scoped>
.link {
  font-size: 1.5rem;
  color: #030303; /* Couleur du lien */
  text-decoration: none; /* Supprimer le soulignement */
  margin-right: 10px; /* Marge à droite pour l'espace entre les liens */
  border: 2px solid black;
  padding: 10px;
  background-color: cornflowerblue;
}

.link:hover {
  text-decoration: underline; /* Soulignement au survol */
}
    .container {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-control,.time {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.btn-primary {
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0056b3;
}
.defis{
  margin-top: 30px;
  padding: 20px;
}
select{
  font-size: 1.1rem;
}
label{
  font-size: 1.1rem;

}
    </style>