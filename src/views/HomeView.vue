<template>
  <h1>Page d'acceuil</h1>
</template>

<script>
import Swal from 'sweetalert2';
import { auth } from '../firebase/firebase';
export default {
  data() {
    return {
    
    };
  },
  computed: {
    userDetails() {
      return this.$store.state.userDetails;
    },
  },
  async mounted() {
    await this.$store.dispatch('fetchUserDetails');
  },
}
</script>



  
