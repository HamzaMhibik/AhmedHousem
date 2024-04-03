<template>
  <div class="emploi-du-temps-container">
    <h1>Emploi de semaine 1</h1>
    <table>
      <thead>
        <tr>
          <th>Jour</th>
          <th v-for="timeSlot in timeSlots" :key="timeSlot">{{ timeSlot }}</th>
          <th>Action</th> <!-- Ajout du titre de la colonne pour l'action -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="day in daysOfWeek" :key="day">
          <td>{{ formatDate(getDateForDay(day)) }}</td>
          <template v-if="emploiDuTemps1[day]">
            <td v-for="timeSlot in timeSlots" :key="timeSlot">
              <p class="ptab" :class="getStateClass(day, timeSlot)" @click="reserver(day, timeSlot)">
                {{ emploiDuTemps1[day][timeSlot] }}
              </p>
            </td>
          </template>
          <template v-else>
            <td colspan="8">Aucune donnée d'emploi du temps disponible pour ce jour.</td>
          </template>
          <td>
            <button @click="toggleReservation(day)">{{ emploiDuTemps1[day] && Object.values(emploiDuTemps1[day]).every(slot => slot === 'non disponible') ? 'Activer réservation' : 'Désactiver réservation' }}</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped>
.reserve {
  background-color: rgb(76, 250, 76); /* Couleur pour l'état réservé */
}

.vide {
  background-color: rgb(250, 250, 253); /* Couleur pour l'état vide */
}

.non-disponible {
  background-color: rgb(255, 0, 0); /* Couleur pour l'état non disponible */
}
  /* Style pour le conteneur principal */
  .emploi-du-temps-container {
    font-family: Arial, sans-serif;
  }

  /* Style pour le titre */
  h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
  }

  /* Style pour la table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  th, td {
    border: 1px solid #dddddd;
    text-align: center;
    padding: 10px;
  }

  th {
    background-color: #f2f2f2;
  }

  /* Style pour les cellules contenant le planning */
  .time-slot-cell {
    position: relative;
  }

  .time-slot-cell button {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }

  .time-slot-cell button:hover {
    background-color: #c82333;
  }

  /* Style pour le message lorsque aucune donnée d'emploi du temps est disponible */
  .no-data-message {
    text-align: center;
    font-style: italic;
    color: #999;
  }
  button {
    padding: 10px 20px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #0056b3;
  }

  button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  /* Style pour le texte à l'intérieur du bouton */
  button span {
    vertical-align: middle;
  }
  .ptab{
    cursor: pointer;
    padding: 10px;
    border: 1px solid black;
  }
</style>


<script>
import { db,auth } from "../../firebase/firebase";
import { collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2'

export default {
  name: "EmploiDuTemps1",
  data() {
    return {
      emploiDuTemps1: {},
      email: '',
      daysOfWeek: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
      timeSlots: ['16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00', '23:00 - 00:00'],
      user: null,
      unsubscribe: null,
      usertype:null,
      verifie:null
    };
  }, computed: {
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
      if(!this.verifie){Swal.fire('Vous devez verifie votre email avant pour accede a cette page3');this.$router.push('/vericationemail');}
    });
    this.getEmploiDuTemps();
  },
  methods: {
    isCancelable(day, timeSlot) {
    // Implement the logic to determine if the reservation is cancelable
    // For example, you can check if the slot is reserved and if it's not in the past
    if (this.emploiDuTemps1[day] && this.emploiDuTemps1[day][timeSlot] === 'reserve') {
      // Check if the time slot is in the future, if so, return true
      const currentTime = new Date();
      const [startHour, endHour] = timeSlot.split(' - ');
      const [startHourStr, startMinuteStr] = startHour.split(':');
      const startHourInt = parseInt(startHourStr);
      const startMinuteInt = parseInt(startMinuteStr);
      const reservationStartTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), startHourInt, startMinuteInt);
      return reservationStartTime > currentTime;
    }
    return false;
  },
    getStateClass(day, timeSlot) {
      const state = this.emploiDuTemps1[day][timeSlot];
      if (state === 'vide') {
        return 'vide'; // Classe CSS pour l'état réservé
      } else if (state === 'non disponible') {
        return 'non-disponible'; // Classe CSS pour l'état vide
      } else {
        return 'reserve'; // Classe CSS pour l'état non disponible
      }
    },
    async getEmploiDuTemps() {
      const usersRef = collection(db, 'proprietaire');
      const q = query(usersRef, where("email", "==", this.email));
      try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
          this.emploiDuTemps1 = doc.data().emploiDuTemps1;
        });
      } catch (error) {
        console.error('Error getting emploi du temps:', error);
      }
    },
    async markDayAsUnavailable(day) {
      const confirmation = await Swal.fire({
        title: 'Êtes-vous sûr(e) de vouloir rendre ce jour indisponible ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, rendre indisponible',
        cancelButtonText: 'Non, ne pas rendre indisponible',
        reverseButtons: true
      });

      if (confirmation.isConfirmed) {
        try {
          const q = query(collection(db, 'proprietaire'), where("email", "==", this.email));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(doc => {
            const stadeDocRef = doc.ref;
            try {
              const unavailableSlots = Object.fromEntries(this.timeSlots.map(slot => [slot, 'non disponible']));
              updateDoc(stadeDocRef, {
                [`emploiDuTemps1.${day}`]: unavailableSlots
              });

              this.emploiDuTemps1[day] = unavailableSlots;
              console.log(`Journée ${day} marquée comme indisponible.`);
              Swal.fire('Journée marquée comme indisponible !', '', 'success');
            } catch (error) {
              console.error("Erreur lors du marquage de la journée comme indisponible:", error);
              Swal.fire('Erreur', "Une erreur s'est produite lors du marquage de la journée comme indisponible.", 'error');
            }
          });
        } catch (error) {
          console.error('Erreur lors du marquage de la journée comme indisponible:', error);
          Swal.fire('Erreur', "Une erreur s'est produitedans la marque de la journée comme indisponible.", 'error');
        }      }},
      async toggleReservation(day) {
        if (this.emploiDuTemps1[day] && Object.values(this.emploiDuTemps1[day]).every(slot => slot === 'non disponible')) {
          // Si tous les créneaux sont non disponibles, alors on active la réservation
          await this.enableReservation(day);
        } else {
          // Sinon, on désactive la réservation
          await this.disableReservation(day);
        }
      },
      async enableReservation(day) {
        const confirmation = await Swal.fire({
          title: 'Êtes-vous sûr(e) de vouloir activer la réservation pour ce jour ?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oui, activer la réservation',
          cancelButtonText: 'Non, ne pas activer la réservation',
          reverseButtons: true
        });

        if (confirmation.isConfirmed) {
          try {
            const q = query(collection(db, 'proprietaire'), where("email", "==", this.email));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => {
              const stadeDocRef = doc.ref;
              try {
                updateDoc(stadeDocRef, {
                  [`emploiDuTemps1.${day}`]: Object.fromEntries(this.timeSlots.map(slot => [slot, 'vide']))
                });

                this.emploiDuTemps1[day] = Object.fromEntries(this.timeSlots.map(slot => [slot, 'vide']));
                console.log(`Journée ${day} activée pour la réservation.`);
                Swal.fire('Réservation activée pour cette journée !', '', 'success');
              } catch (error) {
                console.error("Erreur lors de l'activation de la réservation pour la journée:", error);
                Swal.fire('Erreur', "Une erreur s'est produite lors de l'activation de la réservation pour la journée.", 'error');
              }
            });
          } catch (error) {
            console.error('Erreur lors de l\'activation de la réservation pour la journée:', error);
            Swal.fire('Erreur', "Une erreur s'est produite lors de l'activation de la réservation pour la journée.", 'error');
          }
        }
      },
      async disableReservation(day) {
        const confirmation = await Swal.fire({
          title: 'Êtes-vous sûr(e) de vouloir désactiver la réservation pour ce jour ?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oui, désactiver la réservation',
          cancelButtonText: 'Non, ne pas désactiver la réservation',
          reverseButtons: true
        });

        if (confirmation.isConfirmed) {
          try {
            const q = query(collection(db, 'proprietaire'), where("email", "==", this.email));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => {
              const stadeDocRef = doc.ref;
              try {
                updateDoc(stadeDocRef, {
                  [`emploiDuTemps1.${day}`]: Object.fromEntries(this.timeSlots.map(slot => [slot, 'non disponible']))
                });

                this.emploiDuTemps1[day] = Object.fromEntries(this.timeSlots.map(slot => [slot, 'non disponible']));
                console.log(`Journée ${day} désactivée pour la réservation.`);
                Swal.fire('Réservation désactivée pour cette journée !', '', 'success');
              } catch (error) {
                console.error("Erreur lors de la désactivation de la réservation pour la journée:", error);
                Swal.fire('Erreur', "Une erreur s'est produite lors de la désactivation de la réservation pour la journée.", 'error');
              }
            });
          } catch (error) {
            console.error('Erreur lors de la désactivation de la réservation pour la journée:', error);
            Swal.fire('Erreur', "Une erreur s'est produite lors de la désactivation de la réservation pour la journée.", 'error');
          }
        }
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
      formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
      },
      async reserver(day, timeSlot) {
    if (this.emploiDuTemps1[day] && this.emploiDuTemps1[day][timeSlot] === 'non disponible') {
        const activationConfirmation = await Swal.fire({
            title: "Ce créneau est désactivé pour la réservation. Voulez-vous l'activer?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: "Oui, activer la réservation",
            cancelButtonText: "Non, ne pas activer",
            reverseButtons: true
        });

        if (activationConfirmation.isConfirmed) {
            try {
                const q = query(collection(db, 'proprietaire'), where("email", "==", this.email));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(doc => {
                    const stadeDocRef = doc.ref;
                    try {
                        updateDoc(stadeDocRef, {
                            [`emploiDuTemps1.${day}.${timeSlot}`]: 'vide'
                        });

                        this.emploiDuTemps1[day][timeSlot] = 'vide';
                        console.log(`Créneau horaire ${timeSlot} du jour ${day} activé pour la réservation.`);
                        Swal.fire('Réservation activée pour ce créneau !', '', 'success');
                    } catch (error) {
                        console.error("Erreur lors de l'activation de la réservation:", error);
                        Swal.fire('Erreur', "Une erreur s'est produite lors de l'activation de la réservation.", 'error');
                    }
                });
            } catch (error) {
                console.error('Erreur lors de l\'activation de la réservation:', error);
                Swal.fire('Erreur', "Une erreur s'est produite lors de l'activation de la réservation.", 'error');
            }
        }

        return;
    }

    if (this.emploiDuTemps1[day] && this.emploiDuTemps1[day][timeSlot] !== 'vide') {
        const changeConfirmation = await Swal.fire({
            title: "Ce créneau est déjà réservé. Que souhaitez-vous faire ?",
            icon: 'warning',
            showCancelButton: true, 
            showDenyButton: true,
            cancelButtonText: "Ne pas changer",
            confirmButtonText: "Changer la réservation",
            denyButtonText: "Supprimer la réservation",
            reverseButtons: true
        });

        if (!changeConfirmation.isConfirmed && !changeConfirmation.isDenied) {
            return;
        } else if (changeConfirmation.isDenied) {
            try {
                const q = query(collection(db, 'proprietaire'), where("email", "==", this.email));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(doc => {
                    const stadeDocRef = doc.ref;
                    try {
                        updateDoc(stadeDocRef, {
                            [`emploiDuTemps1.${day}.${timeSlot}`]: 'vide'
                        });

                        this.emploiDuTemps1[day][timeSlot] = 'vide';
                        Swal.fire('Réservation supprimée avec succès !', '', 'success');
                        return
                    } catch (error) {
                        console.error("Erreur lors de la suppression de la réservation:", error);
                        Swal.fire('Erreur', "Une erreur s'est produite lors de la suppression de la réservation.", 'error');
                    }
                });
                return
            } catch (error) {
                console.error('Erreur lors de la suppression de la réservation:', error);
                Swal.fire('Erreur', "Une erreur s'est produite lors de la suppression de la réservation.", 'error');
            }
        }
    }

    const confirmation = await Swal.fire({
        title: "Réserver ce créneau ?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Réserver",
        denyButtonText: `Désactiver la réservation`
    });

    if (confirmation.isConfirmed) {
        const { value: equipe } = await Swal.fire({
            title: "Entrez le nom de l'équipe",
            input: "text",
            inputLabel: "Entrez le nom de l'équipe qui va réserver ce créneau",
            inputPlaceholder: "Entrez le nom de l'équipe"
        });

        if (equipe) {
            try {
                const q = query(collection(db, 'proprietaire'), where("email", "==", this.email));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(doc => {
                    const stadeDocRef = doc.ref;
                    try {
                        updateDoc(stadeDocRef, {
                            [`emploiDuTemps1.${day}.${timeSlot}`]: `reserve pour ${equipe}`
                        });

                        this.emploiDuTemps1[day][timeSlot] = `reserve pour ${equipe}`;
                        Swal.fire(`Créneau horaire ${timeSlot} du jour ${day} réservé pour l'équipe ${equipe} !`, '', 'success');
                    } catch (error) {
                        Swal.fire('Erreur', "Une erreur s'est produite lors de la réservation.", 'error');
                    }
                });
            } catch (error) {
                console.error('Erreur lors de la réservation:', error);
                Swal.fire('Erreur', "Une erreur s'est produite lors de la réservation.", 'error');
            }
        }
    } else if (confirmation.isDenied) {
        try {
            const q = query(collection(db, 'proprietaire'), where("email", "==", this.email));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => {
                const stadeDocRef = doc.ref;
                try {
                    updateDoc(stadeDocRef, {
                        [`emploiDuTemps1.${day}.${timeSlot}`]: 'non disponible'
                    });

                    this.emploiDuTemps1[day][timeSlot] = 'non disponible';
                    Swal.fire('Réservation désactivée', '', 'success');
                } catch (error) {
                    console.error("Erreur lors de la désactivation de la réservation:", error);
                    Swal.fire('Erreur', "Une erreur s'est produite lors de la désactivation de la réservation.", 'error');
                }
            });
        } catch (error) {
            console.error('Erreur lors de la désactivation de la réservation:', error);
            Swal.fire('Erreur', "Une erreur s'est produite lors de la désactivation de la réservation.", 'error');
        }
    }
}

    }
  }
</script>




