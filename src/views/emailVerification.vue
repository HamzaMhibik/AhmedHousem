<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="text-center">
          <h1>Validation d'email</h1>
          <p>Un email a été envoyé à votre adresse email pour validation.</p>
          <center><button @click="envoyereamil" class="btn btn-primary">Renvoyer l'email</button></center>
          <p>Veuillez cliquer sur le lien pour valider votre email.</p>
        </div>
        <hr>
        <div>
          <p>Si vous avez validé votre email, veuillez entrer votre mot de passe puis cliquez sur Vérifier.</p>
          <div class="form-group">
            <input type="password" class="form-control" v-model="password" placeholder="Mot de passe"><br>
          </div>
          <center><button @click="verifievalidationAfterReload" class="btn btn-success btn-block">Vérifier</button></center><br><br>
          <div v-if="errer1" class="alert alert-danger">Mot de passa incorrect</div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.container {
  margin-top: 50px;
}
</style>
<script>
import { auth} from "../firebase/firebase";
import {sendEmailVerification,signInWithEmailAndPassword } from 'firebase/auth';

export default{
  data(){
    return{
      email:'',
      password:'',
      errer1:false
    }
  },
  computed: {
    userDetails() {
      return this.$store.state.userDetails;
    },
  },
  async mounted(){
    await this.$store.dispatch('fetchUserDetails');
    this.email = this.userDetails?.email ?? '';
    this.unsubscribe = auth.onAuthStateChanged(user => {this.user = user;
      if (!this.user) {Swal.fire('Vous devez être connecté pour accéder à cette page19');this.$router.push('/');}
    });
  },
  methods:{
    async envoyereamil() {
      try {
        const user = auth.currentUser; // Récupérer l'utilisateur actuellement connecté
        if (user) {
          // Renvoyer l'e-mail de vérification
          await sendEmailVerification(user);
          console.log("L'e-mail de vérification a été renvoyé avec succès.");
        } else {
          console.error("Aucun utilisateur n'est actuellement connecté.");
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail de vérification :", error);
        this.errorMessage2 = error.message;
      }
    },
    verifievalidationAfterReload() {
       signInWithEmailAndPassword(auth, this.email, this.password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          if (user) {
            this.errer1=false
            // L'utilisateur est connecté, vérifie si son e-mail est vérifié
            await user.reload(); // Recharge les informations de l'utilisateur pour obtenir la dernière vérification de l'e-mail
            if (user.emailVerified) {
              console.log('L\'e-mail de l\'utilisateur est vérifié.');
              this.$router.push('/')
              // Rediriger l'utilisateur vers une autre page ou effectuer une autre action
            } else {
              console.log('L\'e-mail de l\'utilisateur n\'est pas vérifié.');
              // Afficher un message à l'utilisateur ou prendre une autre action appropriée
            }
          }
        })
        .catch(error => {
          this.errer1=true
          console.error('Erreur lors de la vérification de l\'e-mail après reconnexion:', error);
        });
    }
  }
}
</script>
