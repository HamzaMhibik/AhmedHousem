<template>
    <div class="login-container">
        <form class="login-form" @submit.prevent="connection">
            <h2>Connexion</h2>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" v-model="email">
            </div>
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" v-model="password">
            </div>
            <button type="submit">Se connecter</button>
            <div v-if="error" class="alert alert-danger">Email ou mot de passe invalide</div>
        </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            email: '',
            password: '',
            error: false
        }
    },
    methods: {
        connection() {
            if (this.email === 'admin@email.com' && this.password === 'admin123') {
                this.$router.push('/dashboard');
            } else {
                this.error = true;
            }
        }
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.login-form {
    width: 300px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
}

input[type="email"],
input[type="password"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 3px;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}

.alert {
    margin-top: 10px;
    padding: 10px;
    background-color: #ffcaca;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 3px;
}
</style>
