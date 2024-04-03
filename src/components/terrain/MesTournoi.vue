<template>
  <div>
    <h2>Liste des Tournois</h2>
    <div class="tournois-container">
      <div v-for="tournoi in tournois" :key="tournoi.id" class="tournoi">
        <div class="images-container">
          <h4>Images du tournoi :</h4>
          <center><img class="img" v-for="(image, index) in tournoi.images" :src="image.url" :alt="'Image ' + (index + 1)">
          <h2 class="tname">{{ tournoi.nom_tournoi }}</h2></center>
        </div>
        <div class="tournoi-details">
          
          <p><strong>Date de début:</strong> {{ tournoi.date_debut }}</p>
          <p><strong>Date de fin:</strong> {{ tournoi.date_fin }}</p>
          <p><strong>Catégorie:</strong> {{ tournoi.categorie }}</p>
          <p><strong>Description:</strong> {{ tournoi.description }}</p>
          <p><strong>Frais d'inscription:</strong> {{ tournoi.frais_inscription }}</p>
          <p><strong>Recompense:</strong> {{ tournoi.recompense }}</p>
          <p><strong>Nombre d'équipes maximum:</strong> {{ tournoi.nb_equipes_max }}</p>
          <p><strong>Conditions spéciales:</strong> {{ tournoi.conditions_speciales }}</p>
          <div v-if="new Date(tournoi.date_fin) < dateActuelle">
            <center>
              <strong><p class="pp">terminé</p></strong>
              <table><tr>
                <td class="tdd"><button @click="deleteTournoi(tournoi.id)" class="deletbutton">Supprimer</button></td>
                <td><button @click="Voir(tournoi.id)" class="hiden">Voir</button></td>
              </tr></table>
          </center>
          </div>
          <div v-if="new Date(tournoi.date_debut) > dateActuelle ">
            <center>
              <strong><p class="pp">pas encore debuté</p></strong>
              <table><tr>
                <td class="tdd"><button @click="deleteTournoi(tournoi.id)" class="deletbutton">Supprimer</button></td>
                <td><button @click="Voir(tournoi.id)" class="hiden">Voir</button></td>
              </tr></table>
          </center>
          </div>
          <div v-if="new Date(tournoi.date_fin) > dateActuelle && new Date(tournoi.date_debut) < dateActuelle">
            <center>
              <strong><p class="pp">en cours</p></strong>
              <button @click="Voir(tournoi.id)" class="hiden">Voir</button>
            </center>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db,storage,auth } from "../../firebase/firebase"; // Import db from init.js
import { collection, getDocs, deleteDoc, doc,where,query } from 'firebase/firestore';
import { ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import Swal from 'sweetalert2'


export default {
  name: 'ListeTournois',
  data() {
    return {
      tournois: [],
      email:'',
      dateActuelle : new Date(),
      userInfo:{},
      nomstade:'',
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
    this.email = this.userDetails?.email ?? '';
    this.usertype = this.userDetails?.photoURL ?? '';
    this.verifie = this.userDetails?.emailVerified ?? '';
    this.unsubscribe = auth.onAuthStateChanged(user => {this.user = user;
      if (!user) {this.$router.push('/');}
      if(this.usertype!=='proprietaire'){Swal.fire('Cree un compte proprietaire pour accede a cette page');this.$router.push('/');}
      if(!this.verifie){Swal.fire('Vous devez verifie votre email avant pour accede a cette page4');this.$router.push('/vericationemail');}
    });
    await this.getUserInfo();
    await this.getTournois();
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
          console.log('hhhh')
        });
      } catch (error) {
        console.error('Error getting user info:', error);
      }
    },
    async getTournois() {
      try {
        const tournoisSnapshot = await getDocs(collection(db, "tournois"));
        for (const doc of tournoisSnapshot.docs) {
          const tournoiData = doc.data();
          if (tournoiData.email === this.email) { // Ajout du filtre par email
            const images = await this.getImagesForTournoi(tournoiData.nom_tournoi);
            this.tournois.push({
              id: doc.id,
              nom_tournoi: tournoiData.nom_tournoi,
              date_debut: tournoiData.date_debut,
              date_fin: tournoiData.date_fin,
              categorie: tournoiData.categorie,
              description: tournoiData.description,
              frais_inscription: tournoiData.frais_inscription,
              recompense: tournoiData.recompense,
              nb_equipes_max: tournoiData.nb_equipes_max,
              conditions_speciales: tournoiData.conditions_speciales,
              images: images
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des tournois : ", error);
      }
    },
    async getImagesForTournoi(nom_tournoi) {
      const imagesRef = ref(storage, `tournois/${this.nomstade}/${nom_tournoi}`);
      const imageUrls = [];
      const imageList = await listAll(imagesRef);
      for (const imageRef of imageList.items) {
        const imageUrl = await getDownloadURL(imageRef);
        imageUrls.push({ url: imageUrl });
      }
      return imageUrls;
    },
    async deleteTournoi(tournoiId) {
      Swal.fire({
        title: "Supprimer ce tournoi ?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Oui",
        denyButtonText: `Non`
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteDoc(doc(db, "tournois", tournoiId));

            // Supprimer les images associées au tournoi
            const tournoi = this.tournois.find(t => t.id === tournoiId);
            const imagesRef = ref(storage, `stade/${this.email}/${tournoi.nom_tournoi}/`);
            const imageList = await listAll(imagesRef);
            imageList.items.forEach(async imageRef => {
              await deleteObject(imageRef);
            });

            // Mettre à jour la liste locale des tournois après suppression
            this.tournois = this.tournois.filter(t => t.id !== tournoiId);

            console.log("Tournoi supprimé avec succès.");
            Swal.fire("Tournoi supprimé", "", "success");
          } catch (error) {
            console.error("Erreur lors de la suppression du tournoi : ", error);
            Swal.fire("Erreur", "Une erreur s'est produite lors de la suppression du tournoi", "error");
          }
        } else if (result.isDenied) {
          Swal.fire("Tournoi non supprimé", "", "info");
        }
      });
    },
    Voir(tournoiId){
      this.$router.push({ path: 'Tournois1', query: { id: tournoiId } });
    }
  }
}
</script>
<style scoped>
.tname{
  color: saddlebrown;
}
  .tournois-container {
    margin-left: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .tournoi {
    border: 2px solid red;
    margin-bottom: 50px;
    display: flex;
    align-items: flex-start;
    width: calc(50% - 25px); /* 50% width with margin */
  }

  .images-container {
    margin-right: 20px;
  }

  .img {
    width: 200px;
    height: 200px;
    margin-bottom: 10px;
  }

  .tournoi-details {
    flex-grow: 1;
    border-left: solid 1px;
    padding-left: 20px;
  }
  select{
    max-width: 200px;
  }
  .info{
    padding: 10px;
    margin-left: 150px;
  }
  button {
    background-color: rgb(64, 158, 158);
    border: none; /* Supprime les bordures */
    color: #fff; /* Couleur du texte */
    padding: 10px 20px; /* Espacement interne */
    font-size: 16px; /* Taille de la police */
    cursor: pointer; /* Curseur pointeur au survol */
    transition: background-color 0.3s ease; /* Transition en douceur */
    border-radius: 5px; /* Coins arrondis */
    outline: none; /* Supprime la bordure au focus */
  }
  .deletbutton{
    background-color: rgb(203, 39, 39);
    border: none; /* Supprime les bordures */
    color: #fff; /* Couleur du texte */
    padding: 10px 20px; /* Espacement interne */
    font-size: 16px; /* Taille de la police */
    cursor: pointer; /* Curseur pointeur au survol */
    transition: background-color 0.3s ease; /* Transition en douceur */
    border-radius: 5px; /* Coins arrondis */
    outline: none; /* Supprime la bordure au focus */
  }

  /* Style au survol */
  button:hover {
    background-color: #00cccc; /* Couleur de fond au survol */
  }

  /* Style au clic */
  button:active {
    background-color: #009999; /* Couleur de fond au clic */
  }
  h4{
    margin-left: 40px;
  }
  .tdd{
    padding-right: 30px;
  }
 
</style>