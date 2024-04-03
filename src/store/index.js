import { createStore } from 'vuex'
import { getCurrentUser } from '../auth';
export default createStore({
  state: {
    userDetails: {
      displayName: '',
      email: '',
      photoURL: '',
    },
  },
  getters: {
    
  },
  mutations: {
    SET_USER_DETAILS(state, user) {
      state.userDetails = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        emailVerified:user.emailVerified
      };
    },
    RESET_PHOTO_URL(state) {
      state.userDetails.photoURL = null;
    },
  },
  actions: {
    async fetchUserDetails({ commit }) {
      try {
        const currentUser = await getCurrentUser();
        commit('SET_USER_DETAILS', currentUser);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    },
  },
  modules: {
  }
})
