<template>

</template>
<script>
import { db } from "../../firebase/firebase";
import { query, collection, where, getDocs, doc, updateDoc,deleteDoc} from 'firebase/firestore';
import Swal from 'sweetalert2'

export default {
  data() {
      return {
          storedEmail: '',
          equipe: '',
          defis: [],
          defis2: [],
          week:['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'],
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
        
        await this.fetchEquipeByEmail(this.storedEmail);
        await this.fetchDefis(); // Wait for fetchEquipeByEmail to complete before fetching defis
        await this.fetchDefis2();
  },
  methods: {
    async accepterDefi(defiId) {
    try {
        const defiRef = doc(db, "defis", defiId);
        await updateDoc(defiRef, {
            etat: "accepté"
        });

        // Mettre à jour l'état dans la liste locale
        const index = this.defis2.findIndex(defi => defi.id === defiId);
        if (index !== -1) {
            this.defis2[index].etat = "accepte";
        }

        // Récupérer le defi correspondant à defiId
        const defi = this.defis2.find(defi => defi.id === defiId);
        if (defi) {
            // Utilisez defi.stade au lieu de this.defi.stade
            const q = query(collection(db, 'proprietaire'), where("stadiumName", "==", defi.stade));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => {
                const stadeDocRef = doc.ref;
                try {
                    updateDoc(stadeDocRef, {
                        [`emploiDuTemps1.${this.week[defi.index]}.${defi.heureMatch}`]: `reservé pour ${defi.equipe1} vs ${defi.equipe2}`
                    });
                } catch (error) {
                    console.error('Erreur lors de la réservation du créneau horaire:', error);
                }
            });
        }
    } catch (error) {
        console.error("Erreur lors de l'acceptation du défi : ", error);
    }
}
,
      async fetchEquipeByEmail(storedEmail) {
          try {
              const q = query(collection(db, "equipes"), where("email", "==", storedEmail));
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach(async doc => {
                  this.equipe = { ...doc.data(), id: doc.id }; // Ajouter l'ID du document
              });
          } catch (error) {
              console.error("Erreur lors de la récupération d'équipe : ", error);
          }
      },
      async fetchDefis() {
          try {
              const q = query(collection(db, "defis"), where("equipe1", "==", this.equipe.nomEquipe));
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach(doc => {
                  this.defis.push({ ...doc.data(), id: doc.id }); // Ajouter l'ID du document
              });
          } catch (error) {
              console.error("Erreur lors de la récupération des défis : ", error);
          }
      },
      async fetchDefis2() {
          try {
              const q = query(collection(db, "defis"), where("equipe2", "==", this.equipe.nomEquipe));
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach(doc => {
                  this.defis2.push({ ...doc.data(), id: doc.id }); // Ajouter l'ID du document
              });
          } catch (error) {
              console.error("Erreur lors de la récupération des défis : ", error);
          }
      },
      async refuserDefi(defiId) {
          try {
              const defiRef = doc(db, "defis", defiId);
              await updateDoc(defiRef, {
                  etat: "refusé"
              });
              // Mettre à jour l'état dans la liste locale
              const index = this.defis.findIndex(defi => defi.id === defiId);
              if (index !== -1) {
                  this.defis[index].etat = "refusé";
              }
          } catch (error) {
              console.error("Erreur lors du refus du défi : ", error);
          }
      },
      async supprimerDefi(defiId) {
        Swal.fire({
          title: "Supprimer cette defis ?",
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: "supprime",
          denyButtonText: `Non`
        }).then((result) => {
          if (result.isConfirmed) {
            try {
              const defiRef = doc(db, "defis", defiId);
              deleteDoc(defiRef); // Supprimer le document
              // Mettre à jour la liste locale en retirant le défi supprimé
              this.defis = this.defis.filter(defi => defi.id !== defiId);
          } catch (error) {
              console.error("Erreur lors de la suppression du défi : ", error);
          }
          } else if (result.isDenied) {
            Swal.fire("Changes are not saved", "", "info");
          }
        });
          
      },
      async defier(){
          this.$router.push('/defierEquipe')
      }

  }
}
</script>
<style scoped>
.acceptation{
  font-size: 1.5rem;
}
.container {
max-width: 800px;
margin: 0 auto;
}

.title {
text-align: center;
margin-bottom: 30px;
}

.defi-list {
list-style: none;
padding: 0;
}

.defi-item {
background-color: #bfbcbc;
border-radius: 10px;
padding: 20px;
margin-bottom: 20px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.defi-header {
margin-bottom: 10px;
}

.equipe-name {
font-size: 20px;
margin: 0;
}

.match-details {
  font-size: 1.25rem;
color: #555;
margin: 5px 0 0;
}

.message {
margin: 0 0 10px;
}

.etat {
margin: 0;
}

.defi-actions {
  display: flex;
  justify-content: center; /* Centrer horizontalement */
}

.btn {
background-color: #f30808;
padding: 10px 20px;
border: none;
border-radius: 5px;
cursor: pointer;
transition: background-color 0.3s ease;
}
.refuse{
background-color: #0872f3;
padding: 10px 20px;
border: none;
border-radius: 5px;
cursor: pointer;
transition: background-color 0.3s ease;
margin-left: 10px;
}
.accepte{
background-color: #08f320;
padding: 10px 20px;
border: none;
border-radius: 5px;
cursor: pointer;
transition: background-color 0.3s ease;
}

</style>