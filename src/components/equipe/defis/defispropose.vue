<template>
    <div class="defis"><center>
    <router-link to="/defispropose" class="link">Defis proposé</router-link> 
    <router-link to="/defiscree" class="link">Defis créé</router-link>
    <router-link to="/defierEquipe" class="link">Defier un Equipe</router-link>
  </center>
  </div><br>
    <div class="container">
      <h1 class="title">Défis Proposés</h1>
      <ul class="defi-list">
        <div v-if="defis2.length === 0">
                <p>Il n'y a pas de défis pour le moment.</p>
            </div>
            <div v-else>
        <li v-for="(defi, index) in defis2" :key="index" class="defi-item">
          <div class="defi-header">
            <p ><strong class="equipe-name">{{ defi.equipe2 }}</strong> Vous a défié  pour match a:</p>
            <h4>Stade: <strong class="match-details">{{ defi.stade }}</strong><br>
                Date: <strong class="match-details">{{ defi.dateMatch }}</strong> <br> 
                Heure: <strong class="match-details">{{ defi.heureMatch }}</strong></h4>
          </div>
          <div class="defi-body">
            <p class="message"><strong>Message:</strong> {{ defi.message }}</p>
            <p class="etat"><strong>État:</strong> {{ defi.etat }}</p><br>
            <div v-if="defi.etat==='en attent'" class="defi-actions">
                <button @click="accepterDefi(defi.id)" class="accepte">accepter</button>
                <button @click="refuserDefi(defi.id)" class="refuse">refuser</button>
            </div>
            <div v-if="defi.etat=='accepté'">
                <p class="acceptation">Vous avez accepté le defis de <strong class="equipe-name"> {{ defi.equipe2 }}</strong> et le matche est bien reservé</p>
            </div>
            <div v-if="defi.etat=='refusé'">
                <p class="acceptation">Vous avez refusé le defis</p>
            </div>
        </div>
        </li>
    </div>
      </ul>
    </div>
  </template>
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
   .defis{
   margin-top: 30px;
   padding: 20px;
 }
   </style>
  <script>
  import { db,auth } from "../../../firebase/firebase";
  import { query, collection, where, getDocs, doc, updateDoc,deleteDoc} from 'firebase/firestore';
  import Swal from 'sweetalert2'
  
  export default {
    data() {
        return {
            storedEmail: '',
            equipe: '',
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
          if(this.usertype!=='equipe'){Swal.fire('Cree un compte equipe pour accede a cette page');this.$router.push('/');}
          if(!this.verifie){Swal.fire('Valider votre email pour accede a cette page');this.$router.push('/vericationemail');}


        });
        await this.fetchEquipeByEmail(this.storedEmail);
        await this.fetchDefis2();
    },
    methods: {
        async accepterDefi(defiId) {
    Swal.fire({
        title: "Accepter le défi ?",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Accepter",
        denyButtonText: ""
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const defiRef = doc(db, "defis", defiId);
                await updateDoc(defiRef, {
                    etat: "accepté"
                });

                // Mettre à jour l'état dans la liste locale
                const index = this.defis2.findIndex(defi => defi.id === defiId);
                if (index !== -1) {
                    this.defis2[index].etat = "accepté";
                }

                // Récupérer le défi correspondant à defiId
                const defi = this.defis2.find(defi => defi.id === defiId);
                if (defi) {
                    const q = query(collection(db, 'proprietaire'), where("stadiumName", "==", defi.stade));
                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach(async doc => {
                        const stadeDocRef = doc.ref;
                        try {
                            // Vérifier si le créneau est vide ou non avant de le réserver
                            const emploiDuTemps = doc.data().emploiDuTemps1[this.week[defi.index]][defi.heureMatch];
                            if (emploiDuTemps === 'vide') {
                                // Réserver le créneau
                                await updateDoc(stadeDocRef, {
                                    [`emploiDuTemps1.${this.week[defi.index]}.${defi.heureMatch}`]: `Defis: ${defi.equipe1} vs ${defi.equipe2}`
                                });
                            } else {
                                // Créneau non disponible, mettre à jour l'état du défi en "annulé"
                                await updateDoc(defiRef, {
                                    etat: "annulé"
                                });
                                // Mettre à jour l'état dans la liste locale
                                this.defis2[index].etat = "annulé";
                                console.log('Créneau non disponible');
                                Swal.fire("Créneau non disponible", "", "error");
                            }
                        } catch (error) {
                            console.error('Erreur lors de la réservation du créneau horaire:', error);
                        }
                    });
                }
            } catch (error) {
                console.error("Erreur lors de l'acceptation du défi : ", error);
            }
            Swal.fire("Défi accepté!", "", "success");
        }
    });
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
            Swal.fire({
                title: "Êtes-vous sûr de vouloir refuser ce défi ?",
                showDenyButton: false,
                showCancelButton: true,
                confirmButtonText: "Refuser",
                denyButtonText: `Annuler`
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const defiRef = doc(db, "defis", defiId);
                        await updateDoc(defiRef, {
                            etat: "refusé"
                        });
                        // Mettre à jour l'état dans la liste locale des défis où votre équipe est l'équipe 2
                        const index = this.defis2.findIndex(defi => defi.id === defiId);
                        if (index !== -1) {
                            this.defis2[index].etat = "refusé";
                        }
                    } catch (error) {
                        console.error("Erreur lors du refus du défi : ", error);
                    }
                    Swal.fire("Défi refusé!", "", "info");
                } 
            });
        },

  
    }
  }
  </script>
 