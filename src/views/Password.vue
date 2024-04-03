<template>
    <div class="forgot-password">
        <center>
            <h1>Mot de passe oublié</h1>
            <label for="email">Entrez votre adresse e-mail :</label>
            <input type="email" v-model="email" placeholder="Adresse e-mail"><br>
            <button @click="resetPassword">Réinitialiser mot de passe</button>
            <br>
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
            <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        </center>
    </div>
</template>
<style scoped>
.forgot-password {
    margin-top: 50px;
}

.forgot-password h1 {
    font-size: 24px;
}

.forgot-password label {
    display: block;
    margin-bottom: 10px;
}

.forgot-password input[type="email"] {
    width: 300px;
    height: 40px;
    padding: 5px;
    font-size: 16px;
}

.forgot-password button {
    width: 200px;
    height: 40px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 20px;
}

.forgot-password button:hover {
    background-color: #0056b3;
}

.error-message, .success-message {
    margin-top: 10px;
    font-size: 14px;
}

.error-message {
    color: red;
}

.success-message {
    color: green;
}
</style>

<script>
    import { getAuth, sendPasswordResetEmail } from 'firebase/auth'; // Import des fonctionnalités Firebase version 9

    // Initialisez l'objet auth Firebase
    const auth = getAuth();

    export default {
        data() {
            return {
                email: '', // Liaison de la valeur de l'entrée à cette propriété de données
                errorMessage: '',
                successMessage: ''
            }
        },
        methods: {
            async resetPassword() {
                try {
                    await sendPasswordResetEmail(auth, this.email); // Utilisation de la fonction sendPasswordResetEmail de Firebase
                    // Notifiez l'utilisateur que l'e-mail a été envoyé
                    alert('Un email de réinitialisation de mot de passe a été envoyé à votre adresse.');
                } catch (error) {
                    // Gérer les erreurs
                    console.error('Erreur lors de l\'envoi de l\'email de réinitialisation de mot de passe:', error.message);
                    alert('Erreur lors de l\'envoi de l\'email de réinitialisation de mot de passe. Veuillez réessayer plus tard.');
                }
            },
        }
    }
</script>


