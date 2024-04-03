import { auth } from './firebase/firebase'; // Importez votre objet authentification Firebase

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe(); // Unsubscribe pour éviter les fuites de mémoire
      if (user) {
        resolve(user);
      } else {
      }
    }, reject);
  });
};