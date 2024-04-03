<template>
    <div>
      <div class="stadium-info">
        <h2>Informations sur le Stade</h2>
        <p><strong>Nom du Stade:</strong> {{ userInfo.stadiumName }}</p>
        <p><strong>Adresse:</strong> {{ userInfo.address }}</p>
        <p><strong>Description:</strong> {{ userInfo.description }}</p>
        <p><strong>Prix de réservation:</strong> {{ userInfo.reservationPrice }}</p>
        <p><strong>email de Stade:</strong> {{ userInfo.email }}</p>
        <p><strong>nimrero de telephone:</strong> {{ userInfo.telephone }}</p>
        <p><strong>ville de Stade:</strong> {{ userInfo.ville }}</p>
        <div class="rating">
            <strong>note de stade</strong> {{ averageRating.toFixed(2) }}
        </div>
      </div>
      <div class="images-container">
      <h2>Images des Stades</h2>
      <div class="image-row">
        <div v-if="images.length === 0" class="no-images-message">Aucune image téléchargée.</div>
        <div v-else class="image-item" v-for="(image, index) in images" :key="index">
          <img :src="image.url" alt="Uploaded Image">
        </div>
      </div>
    </div>
      <!-- Affichage de l'emploi du temps du stade -->
      <div class="schedule">
        <h2>Emploi de cette semaine</h2>
        <table>
          <thead>
            <tr>
              <th>Jour</th>
              <th>16:00 - 17:00</th>
              <th>17:00 - 18:00</th>
              <th>18:00 - 19:00</th>
              <th>19:00 - 20:00</th>
              <th>20:00 - 21:00</th>
              <th>21:00 - 22:00</th>
              <th>22:00 - 23:00</th>
              <th>23:00 - 00:00</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in daysOfWeek" :key="day">
              <td>{{ formatDate(getDateForDay(day)) }}</td>
              <template v-if="emploiDuTemps1[day]">
              <td>
                <p :class="{ 'reserved-by-user': isReservedByUser(day, '16:00 - 17:00'),
                'reserved-by-others': !isReservedByUser(day, '16:00 - 17:00'),
                'empty-slot': emploiDuTemps1[day]['16:00 - 17:00'] === 'vide' }"
                @click="reserveTimeSlot(day, '16:00 - 17:00')">{{ emploiDuTemps1[day]['16:00 - 17:00'] }}</p>
              </td>

              <td>
                <p :class="{ 'reserved-by-user': isReservedByUser(day, '17:00 - 18:00'),
                'reserved-by-others': !isReservedByUser(day, '17:00 - 18:00'),
                'empty-slot': emploiDuTemps1[day]['17:00 - 18:00'] === 'vide' }"
                @click="reserveTimeSlot(day, '17:00 - 18:00')">{{ emploiDuTemps1[day]['17:00 - 18:00'] }}</p>
              </td>

              <td>
                <p :class="{ 'reserved-by-user': isReservedByUser(day, '18:00 - 19:00'),
                'reserved-by-others': !isReservedByUser(day, '18:00 - 19:00'),
                'empty-slot': emploiDuTemps1[day]['18:00 - 19:00'] === 'vide' }"
                @click="reserveTimeSlot(day, '18:00 - 19:00')">{{ emploiDuTemps1[day]['18:00 - 19:00'] }}</p>
              </td>

              <td >
                <p :class="{ 'reserved-by-user': isReservedByUser(day, '19:00 - 20:00'),
                 'reserved-by-others': !isReservedByUser(day, '19:00 - 20:00'),
                  'empty-slot': emploiDuTemps1[day]['19:00 - 20:00'] === 'vide' }"
                  @click="reserveTimeSlot(day, '19:00 - 20:00')">{{ emploiDuTemps1[day]['19:00 - 20:00'] }}</p>
              </td>
              <td >
                <p :class="{ 'reserved-by-user': isReservedByUser(day, '20:00 - 21:00'),
                 'reserved-by-others': !isReservedByUser(day, '20:00 - 21:00'),
                  'empty-slot': emploiDuTemps1[day]['20:00 - 21:00'] === 'vide' }"
                  @click="reserveTimeSlot(day, '20:00 - 21:00')">{{ emploiDuTemps1[day]['20:00 - 21:00'] }}</p>
              </td>
              <td >
                <p :class="{ 'reserved-by-user': isReservedByUser(day, '21:00 - 22:00'),
                 'reserved-by-others': !isReservedByUser(day, '21:00 - 22:00'),
                  'empty-slot': emploiDuTemps1[day]['21:00 - 22:00'] === 'vide' }"
                  @click="reserveTimeSlot(day, '21:00 - 22:00')">{{ emploiDuTemps1[day]['21:00 - 22:00'] }}</p>
              </td>
              <td >
                <p :class="{ 'reserved-by-user': isReservedByUser(day, '22:00 - 23:00'),
                 'reserved-by-others': !isReservedByUser(day, '22:00 - 23:00'),
                  'empty-slot': emploiDuTemps1[day]['22:00 - 23:00'] === 'vide' }"
                  @click="reserveTimeSlot(day, '22:00 - 23:00')">{{ emploiDuTemps1[day]['22:00 - 23:00'] }}</p>
              </td>
              <td >
                <p :class="{ 'reserved-by-user': isReservedByUser(day, '23:00 - 00:00'),
                 'reserved-by-others': !isReservedByUser(day, '23:00 - 00:00'),
                  'empty-slot': emploiDuTemps1[day]['23:00 - 00:00'] === 'vide' }"
                  @click="reserveTimeSlot(day, '23:00 - 00:00')">{{ emploiDuTemps1[day]['23:00 - 00:00'] }}</p>
              </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
          donner une note le stade:
          <select v-model="note">
            <option value="">Donner une note</option>
            <option value="1">1</option>
            <option value="1.5">1.5</option>
            <option value="2">2</option>
            <option value="2.5">2.5</option>
            <option value="3">3</option>
            <option value="3.5">3.5</option>
            <option value="4">4</option>
            <option value="4.5">4.5</option>
            <option value="5">5</option>
          </select>
        <button @click="submitRating">evaluer</button>
        <div v-if="userInfo.usersrating && userInfo.usersrating.hasOwnProperty(equipe.nomEquipe) ">
            <p>Votre equipe a donné un note
               : <span class="noteequipe">{{ userInfo.usersrating[equipe.nomEquipe] }}/10</span> pour cette stade</p>
        </div>
        <div v-else>
            <p>L'équipe {{ equipe.nomEquipe }} n'a pas encore de note.</p>
        </div>
        </div>
      <div class="comment-section">
      <h2>Commentaires</h2>
      <textarea rows="4" cols="50" placeholder="Laissez votre commentaire ici" v-model="newComment"></textarea>
      <button @click="submitComment()">Envoyer</button>

      <!-- Affichage des commentaires -->
      <div class="comments-container">
        <div v-for="comment in comments" :key="comment.id" class="comment">
          <p>{{ comment.comment }}</p>
          <p class="comment-email">Par : {{ comment.nomequipe }}</p>
          <button v-if="comment.nomequipe==this.equipe.nomEquipe" @click="deleteComment(comment.id)">Supprimer</button>
        </div>
      </div>
    </div>
    </div>
  </template>
  
  <script>
  import { db,storage,auth } from "../../firebase/firebase";
  import { collection, getDocs, query, where, updateDoc,addDoc,deleteDoc,doc } from 'firebase/firestore';
  import { ref,listAll, getDownloadURL } from "firebase/storage";
  import Swal from 'sweetalert2'


  
  export default {
    name: "StadiumInfoAndSchedule",
    data() {
      return {
        note:'',
        images: [],
        newComment:'',
        comments:null,
        storedEmail:'',
        nomStade:null,
        userInfo: {},
        emploiDuTemps1: {},
        daysOfWeek: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
        equipe:'',
        user: null,
        unsubscribe: null,
        usertype:null,
        verifie:null
        
        //emailstade
      };
    },
    created(){
      this.nomStade = this.$route.query.stade;
    },
    computed: {
    userDetails() {
      return this.$store.state.userDetails;
    },
    averageRating() {
            if (this.userInfo.nbvote > 0) {
                return this.userInfo.sovote / this.userInfo.nbvote;
            } else {
                return 0; // Ou toute autre valeur par défaut que vous préférez
            }
        }
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
      await this.getUserInfo();
      await this.fetchCommentsByEmail(this.nomStade); // Correction du nom de la méthode ici
      await this.fetchEquipeByEmail(this.storedEmail);
      await this.getUploadedImages();

    // Charger les données du calendrier uniquement si elles ne sont pas déjà définies localement
    if (Object.keys(this.emploiDuTemps1).length === 0) {
        this.getEmploiDuTemps1();
    }

    setInterval(this.checkMidnight, 1000 * 50);
    
    },
    methods: {
      isReservedByUser(day, timeSlot) {
    // Vérifiez si le créneau est réservé par l'équipe de l'utilisateur
    return this.emploiDuTemps1[day][timeSlot] === `reservé pour ${this.equipe.nomEquipe}`;
  },
      async submitRating() {
        try {
            const usersRef = collection(db, 'proprietaire');
            const q = query(usersRef, where("stadiumName", "==", this.nomStade));
            const querySnapshot = await getDocs(q); // Attendre la résolution de la requête

            if (this.userInfo.usersrating && this.userInfo.usersrating.hasOwnProperty(this.equipe.nomEquipe)) {
                // Si l'équipe a déjà donné une note, récupérer l'ancienne note
                const oldNote = this.userInfo.usersrating[this.equipe.nomEquipe];

                // Afficher la boîte de dialogue de confirmation
                const result = await Swal.fire({
                    title: "Changer votre note?",
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: "Oui",
                    denyButtonText: `Non`
                });

                if (result.isConfirmed) {
                    const newTotalVotes = this.userInfo.sovote - oldNote + parseInt(this.note);
                    const updatedUserRating = { ...this.userInfo.usersrating, [this.equipe.nomEquipe]: parseInt(this.note) };

                    querySnapshot.forEach(async doc => {
                        const stadeDocRef = doc.ref;

                        try {
                            // Mettre à jour les données de l'utilisateur avec les nouvelles valeurs
                            await updateDoc(stadeDocRef, {
                                sovote: newTotalVotes,
                                usersrating: updatedUserRating
                            });

                            // Mettre à jour les données locales
                            this.userInfo.sovote = newTotalVotes;
                            this.userInfo.usersrating = updatedUserRating;

                            console.log("Évaluation mise à jour avec succès.");
                        } catch (error) {
                            console.error("Erreur lors de la mise à jour de l'évaluation :", error);
                        }
                    });

                    Swal.fire("Note Changée", "", "success");
                } else if (result.isDenied) {
                    Swal.fire("Changement annulé", "", "info");
                }
            } else {
                // Afficher la boîte de dialogue de confirmation
                const result = await Swal.fire({
                    title: `Donne une note ${this.note} a cette stade`,
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: "Oui",
                    denyButtonText: `Non`
                });

                if (result.isConfirmed) {
                    const newTotalVotes = this.userInfo.sovote + parseInt(this.note);
                    const newVoteCount = this.userInfo.nbvote + 1;

                    querySnapshot.forEach(async doc => {
                        const stadeDocRef = doc.ref;

                        try {
                            // Mettre à jour les données de l'utilisateur avec les nouvelles valeurs
                            await updateDoc(stadeDocRef, {
                                nbvote: newVoteCount,
                                sovote: newTotalVotes,
                                [`usersrating.${this.equipe.nomEquipe}`]: parseInt(this.note)
                            });

                            // Mettre à jour les données locales
                            this.userInfo.nbvote = newVoteCount;
                            this.userInfo.sovote = newTotalVotes;

                            console.log("Évaluation enregistrée avec succès.");
                        } catch (error) {
                            console.error("Erreur lors de la mise à jour de l'évaluation :", error);
                        }
                    });

                    Swal.fire("Note enregistrée", "", "success");
                } else if (result.isDenied) {
                    Swal.fire("Note non enregistrée", "", "info");
                }
            }
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'évaluation :", error);
        }
}

,
      async checkMidnight() {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
          await this.updateScheduleDaily(); // Appeler la méthode pour mettre à jour l'emploi du temps
        }
      },
      async getUploadedImages() {
        const imagesRef = ref(storage, `Stades/${this.nomStade}/`);
        try {
          const res = await listAll(imagesRef);
          const promises = res.items.map(item => getDownloadURL(item).then(url => ({ url, name: item.name })));
          this.images = await Promise.all(promises);
        } catch (error) {
          console.error('Error getting uploaded images:', error);
        }
      },
      formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
      },
      getDateForDay(day) {
        const today = new Date();
        const nextSevenDays = [0, 1, 2, 3, 4, 5, 6].map(offset => {
            const date = new Date(today);
            date.setDate(today.getDate() + offset);
            return date;
        });
        const dayIndex = this.daysOfWeek.indexOf(day);
        const targetDate = nextSevenDays[dayIndex];
        return targetDate;
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
      async getUserInfo() {
        const usersRef = collection(db, 'proprietaire');
        const q = query(usersRef, where("stadiumName", "==", this.nomStade));
        try {
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(doc => {
            this.userInfo = doc.data();
          });
        } catch (error) {
          console.error('Error getting user info:', error);
        }
      },
      async getEmploiDuTemps1() {
        const usersRef = collection(db, 'proprietaire');
        const q = query(usersRef, where("stadiumName", "==", this.nomStade));
        try {
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(doc => {
            this.emploiDuTemps1 = doc.data().emploiDuTemps1;
          });
        } catch (error) {
          console.error('Error getting emploi du temps:', error);
        }
      },
      async reserveTimeSlot(day, timeSlot) {
    // Check if the time slot is already reserved
    if (this.emploiDuTemps1[day][timeSlot] === `reservé pour ${this.equipe.nomEquipe}`) {
        Swal.fire({
            title: "Voulez-vous annuler votre réservation pour ce créneau ?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Oui",
            denyButtonText: "Non",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const q = query(collection(db, 'proprietaire'), where("stadiumName", "==", this.nomStade));
                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach(doc => {
                        const stadeDocRef = doc.ref; // Get the reference from the document snapshot
                        try {
                            updateDoc(stadeDocRef, {
                                [`emploiDuTemps1.${day}.${timeSlot}`]: "vide"
                            });
                            // Update local data
                            this.emploiDuTemps1[day][timeSlot] = "vide";
                            console.log(`Réservation annulée pour le créneau horaire ${timeSlot} du jour ${day}.`);
                            // Refresh the display by forcing data reassignment
                            this.emploiDuTemps1 = { ...this.emploiDuTemps1 };
                            Swal.fire({title: "Annulation!",text: "Reservation annulé!",icon: "success"});
                        } catch (error) {
                            console.error('Erreur lors de l\'annulation de la réservation:', error);
                        }
                    });
                } catch (error) {
                    console.error('Erreur lors de la récupération des documents:', error);
                }
            }
        });
        //si le creneau est vide
    } else if (this.emploiDuTemps1[day][timeSlot] === "vide") {
        Swal.fire({
            title: "Voulez-vous réserver ce créneau ?",
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "Réserver",
            denyButtonText: "Non",
        }).then(async (result) => {
            if (result.isConfirmed) {
                if (!this.nomStade) {
                    console.error('Email du stade manquant.');
                    return;
                }
                try {
                    const q = query(collection(db, 'proprietaire'), where("stadiumName", "==", this.nomStade));
                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach(doc => {
                        const stadeDocRef = doc.ref; // Get the reference from the document snapshot
                        try {
                            updateDoc(stadeDocRef, {
                                [`emploiDuTemps1.${day}.${timeSlot}`]: `reservé pour ${this.equipe.nomEquipe}`
                            });
                            // Update local data
                            this.emploiDuTemps1[day][timeSlot] = `reservé pour ${this.equipe.nomEquipe}`;
                            console.log(`Créneau horaire ${timeSlot} du jour ${day} réservé.`);
                            // Refresh the display by forcing data reassignment
                            this.emploiDuTemps1 = { ...this.emploiDuTemps1 };
                            Swal.fire({title: "Reservation!",text: "Reservation effectue!",icon: "success"});
                        } catch (error) {
                            console.error('Erreur lors de la réservation du créneau horaire:', error);
                        }
                    });
                } catch (error) {
                    console.error('Erreur lors de la récupération des documents:', error);
                }
            }
        });
        //si le creneau est reserve par un autre equipe
    } else {
        console.error(`Le créneau horaire ${timeSlot} du jour ${day} est déjà réservé.`);
    }
},
      async submitComment() {
        Swal.fire({
          title: "Enregistré le commentaire ?",
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: "Oui",
          denyButtonText: `Non`
        }).then((result) => {
          if (result.isConfirmed) {
            try {
              const commentRef =  addDoc(collection(db, "comments"), {
                nomstade: this.nomStade,
                comment: this.newComment,
                nomequipe: this.equipe.nomEquipe
              });
              if(commentRef){
                console.log(this.equipe.nomequipe)
                console.log("Commentaire enregistré");
              this.newComment = '';

              // Actualiser les commentaires après avoir ajouté un nouveau
              this.fetchCommentsByEmail(this.nomStade);
              Swal.fire("Commentaire enregistré", "", "success");
              }
            
            } catch (error) {
              console.error("Erreur lors de l'enregistrement du commentaire : ", error);
            }
          } else if (result.isDenied) {
            Swal.fire("Commentaire annulé", "", "info");
          }
        });
        
      },

      // Dans votre composant
      async fetchCommentsByEmail(nomStade) {
        try {
          const q = query(collection(db, "comments"), where("nomstade", "==", nomStade));
          const querySnapshot = await getDocs(q);
          this.comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error("Erreur lors de la récupération des commentaires :", error);
        }
      },
    async deleteComment(commentId) {
        try {
            // Supprimer le commentaire avec l'ID donné de la collection dans Firestore
            await deleteDoc(doc(db, "comments", commentId));

            // Actualiser les commentaires après avoir supprimé le commentaire
            this.fetchCommentsByEmail(this.nomStade);

            Swal.fire("Commentaire supprimé", "", "success");
        } catch (error) {
            console.error("Erreur lors de la suppression du commentaire :", error);
            Swal.fire("Erreur", "Une erreur s'est produite lors de la suppression du commentaire.", "error");
        }
    },
async updateScheduleDaily() {
    for (let i = 0; i < this.daysOfWeek.length; i++) {
        const currentDay = this.daysOfWeek[i];
        const nextDay = this.daysOfWeek[i + 1];
        
        // Vérifiez si c'est le dernier jour de la semaine
        if (nextDay) {
            // Obtenez les données du jour suivant
            const nextDayData = this.emploiDuTemps1[nextDay];

            // Mettez à jour les données du jour actuel avec les données du jour suivant
            this.emploiDuTemps1[currentDay] = { ...nextDayData };

            // Mettez à jour dans la base de données si nécessaire
            await this.updateScheduleInDatabase(currentDay);

            console.log(`Données du jour ${currentDay} mises à jour avec les données du jour ${nextDay}.`);
        } else {
            // Si c'est le dernier jour, initialisez les données
            this.emploiDuTemps1[currentDay] = this.initializeScheduleDay();
            await this.updateScheduleInDatabase(currentDay);

            console.log(`Données du jour ${currentDay} initialisées.`);
        }
    }
},

async updateScheduleInDatabase(day) {
    // Mettez à jour les données dans la base de données Firebase
    const q = query(collection(db, 'proprietaire'), where("stadiumName", "==", this.nomStade));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
        const stadeDocRef = doc.ref;
        try {
            updateDoc(stadeDocRef, {
                [`emploiDuTemps1.${day}`]: this.emploiDuTemps1[day],
            });
        } catch (error) {
            console.error("Erreur lors de la mise à jour des données du jour dans la base de données :", error);
        }
    });
},

getCurrentDayOfWeek() {
    const currentDate = new Date();
    return this.daysOfWeek[currentDate.getDay() - 1];
},

clearSchedule(day) {
    // Effacer les données du jour spécifié
    return new Promise(async (resolve, reject) => {
        try {
            const q = query(collection(db, 'proprietaire'), where("stadiumName", "==", this.nomStade));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => {
                const stadeDocRef = doc.ref;
                try {
                    updateDoc(stadeDocRef, {
                        [`emploiDuTemps1.${day}`]: { ...this.initializeScheduleDay() },
                    });
                    console.log(`Données de l'emploi du temps pour ${day} effacées.`);
                    resolve();
                } catch (error) {
                    console.error("Erreur lors de l'effacement des données du jour :", error);
                    reject(error);
                }
            });
        } catch (error) {
            console.error("Erreur lors de la récupération des données du stade :", error);
            reject(error);
        }
    });
  },
initializeScheduleDay() {
    // Initialise les données de l'emploi du temps pour une journée
    return {
        '16:00 - 17:00': 'vide',
        '17:00 - 18:00': 'vide',
        '18:00 - 19:00': 'vide',
        '19:00 - 20:00': 'vide',
        '20:00 - 21:00': 'vide',
        '21:00 - 22:00': 'vide',
        '22:00 - 23:00': 'vide',
        '23:00 - 00:00': 'vide'
    };
},
    }
  }
  </script>
  
  <style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
}
td{
  width: 50px;
  height: 50px;
}
.stadium-info,
.schedule,
.comment-section {
  margin-bottom: 20px;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 15px;
}

.info p {
  margin: 5px 0;
}

.schedule table {
  width: 100%;
  border-collapse: collapse;
}

.schedule th,
.schedule td {
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
}

.time-slot {
  background-color: #eeeef1;
  cursor: pointer;
  padding: 10px;
  margin: 0;
}

.time-slot:hover {
  background-color: #ddd;
}

button {
  padding: 8px 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.image-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.image-item {
  flex: 0 0 30%; /* Pour que chaque image occupe 30% de la largeur de son conteneur */
  margin-bottom: 20px;
}

.image-item img {
  width: 100%;
  height: auto;
}

button:hover {
  background-color: #0056b3;
}

.comment-section textarea {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  font-size: 1rem;
}

.comments-container {
  margin-top: 20px;
}

.comment {
  background-color: #f4f4f4;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.comment p {
  margin: 0;
}

.comment-email {
  font-style: italic;
  color: #666;
}
p,.rating{
  border: 1px solid black;
}
select{
  max-width: 100px;
}
.noteequipe{
  font-style: italic;
  font-size: 1.25rem;
  color: brown;
}
select{
  width: 200px;
}
.reserved-by-user {
  background-color: green; /* ou toute autre couleur que vous préférez */
  font-size: 1.1rem;
  cursor: pointer;
  width: 100%;
  height: 100%;
  padding: 10px
}

.reserved-by-others {
  background-color: red; /* ou toute autre couleur que vous préférez */
  font-size: 1.1rem;
  width: 100%;
  height: 100%;
  padding: 10px
}
.empty-slot {
  background-color: rgb(255, 255, 255);
  font-size: 1.1rem;
  cursor: pointer;
  width: 100%;
  height: 100%;
  padding: 10px
}
</style>

<!-- Email du stade manquant. -->