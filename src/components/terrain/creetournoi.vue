<template>
  <div>
    <h2>Formulaire de Création de Tournoi</h2>
    <form @submit.prevent="enregistrerTournoi">
      <label for="nom_tournoi">Nom du tournoi :</label><br>
      <input type="text" v-model="nom_tournoi" required><br><br>
      
      <label for="date_debut">Date de début du tournoi :</label><br>
      <input type="date" v-model="date_debut" required><br><br>
      
      <label for="heure_debut">Heure de début du tournoi :</label><br>
      <input type="time" v-model="heure_debut" required><br><br>
      
      <label for="date_fin">Date de fin du tournoi :</label><br>
      <input type="date" v-model="date_fin" required><br><br>
      
      <label for="categorie">Catégorie du tournoi :</label><br>
      <select v-model="categorie" required>
        <option value="amateur">Amateur</option>
        <option value="professionnel">Professionnel</option>
        <option value="mixte">Mixte</option>
      </select><br><br>
      
      <label for="description">Description du tournoi :</label><br>
      <textarea v-model="description" rows="4" cols="50" required></textarea><br><br>
      
      <label for="frais_inscription">Frais d'inscription par équipe :</label><br>
      <input type="number" v-model="frais_inscription" required><br><br>
      
      <label for="nb_equipes_max">Nombre d'équipes maximum autorisées :</label><br>
      <input type="number" v-model="nb_equipes_max" required><br><br>

      <label for="nom_tournoi">Recompense de tournoi :</label><br>
      <textarea v-model="recompense" rows="4" cols="50" required></textarea><br><br>
      
      <label for="conditions_speciales">Conditions spéciales :</label><br>
      <textarea v-model="conditions_speciales" rows="4" cols="50"></textarea><br><br>
      
      <label for="image">Image du tournoi :</label><br>
      <input type="file" ref="myfiles" accept=".png,.jpg"><br><br>
      
      <input type="submit" value="Créer Tournoi">
    </form>
  </div>
</template>
<style  scoped>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: white;
}

h2 {
  text-align: center;
  color: #333;
}

form {
  max-width: 500px;
  margin: 20px auto;
  background-color: greenyellow;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

label {
  font-weight: bold;
}

input[type="password"],
input[type="text"],
input[type="tel"],
input[type="number"],
input[type="file"],
input[type="time"],
input[type="date"],
select,
textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

input[type="submit"] {
  width: 100%;
  background-color: #007bff;
  color: #fff;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

input[type="submit"]:hover {
  background-color: #0056b3;
}
</style>

<script>
import { storage,db,auth } from "../../firebase/firebase";
import { collection, addDoc, where, query, getDocs } from 'firebase/firestore'; // Import firestore functions for querying
import { ref, uploadBytes } from "firebase/storage";
import Swal from 'sweetalert2'

export default {
  name: 'CreationTournoi',
  data() {
    return {
      nom_tournoi: '',
      date_debut: '',
      heure_debut: '',
      date_fin: '',
      heure_fin: '',
      categorie: '',
      description: '',
      recompense:'',
      frais_inscription: '',
      nb_equipes_max: '',
      conditions_speciales: '',
      email: '',
      numberOfFiles: 0,
      equipes:[],
      images: [],
      userInfo: {}, // Ajoutez cette ligne
      nomstade: '',
      ville:'',
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
    this.usertype = this.userDetails?.photoURL ?? '';
    this.verifie = this.userDetails?.emailVerified ?? '';
    this.unsubscribe = auth.onAuthStateChanged(user => {this.user = user;
      if (!user) {this.$router.push('/');}
      if(this.usertype!=='proprietaire'){Swal.fire('Cree un compte proprietaire pour accede a cette page');this.$router.push('/');}
      if(!this.verifie){Swal.fire('Vous devez verifie votre email avant pour accede a cette page2');this.$router.push('/vericationemail');}
    });
    this.email = this.userDetails?.email ?? '';
    await this.getUserInfo();
    
  },
  methods: {
    async getUserInfo() {
      const usersRef = collection(db, 'proprietaire');
      const q = query(usersRef, where("email", "==", this.email));
      try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          this.userInfo = { ...doc.data(), id: doc.id }; // Ajouter l'ID du document
          this.nomstade = this.userInfo.stadiumName;
          this.ville = this.userInfo.ville
        });
      } catch (error) {
        console.error('Error getting user info:', error);
      }
    },

    async enregistrerTournoi() {
      await this.getUserInfo();
      Swal.fire({
        title: "Cree le tournoi ?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "OUI",
        denyButtonText: `Non`
      }).then((result) => {
        if (result.isConfirmed) {
          try {
        const files = this.$refs.myfiles.files;
        const tournoiRef =  addDoc(collection(db, "tournois"), {
          nom_tournoi: this.nom_tournoi,
          date_debut: this.date_debut,
          heure_debut: this.heure_debut,
          date_fin: this.date_fin,
          heure_fin: this.heure_fin,
          categorie: this.categorie,
          description: this.description,
          frais_inscription: this.frais_inscription,
          nb_equipes_max: this.nb_equipes_max,
          conditions_speciales: this.conditions_speciales,
          email: this.email,
          recompense:this.recompense,
          nomstade:this.nomstade,
          equipes:this.equipes,
          ville:this.ville
        });

        const imagesRef1 = ref(storage, `tournois/${this.nomstade}/${this.nom_tournoi}`);
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const storageRef = ref(imagesRef1, `image${this.numberOfFiles + i + 1}.png`);
          uploadBytes(storageRef, file);
        }
        console.log("Tournoi enregistré!", tournoiRef.id);
        this.$router.push('/MesTournois');
        // Redirection or other actions after saving
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du tournoi : ", error);
      }
          Swal.fire("Saved!", "", "success");
        } else if (result.isDenied) {
          Swal.fire("Tournois non creé", "", "info");
        }
      });
      
    },
    

  }
}
</script>



