<template>
    <div>
        <nav>
            <router-link to="/equipes" class="link">Equipes</router-link>
            <router-link to="/stades" class="link">Stades</router-link>
            <router-link to="/joueurs" class="link">Joueurs</router-link>
            <router-link to="/tournois" class="link">Tournois</router-link>
            <router-link to="/defis" class="link">Défis</router-link>
            <router-link to="/recrutements" class="link">Recrutements</router-link>
            <router-link to="/commentaires" class="link">Commentaires</router-link>
        </nav>
    </div>
</template>

<script>
    export default {
        data() {
            return {}
        }
    }
</script>

<style scoped>
    /* Style du navbar */
    nav {
        background-color: #333; /* Couleur de fond */
        padding: 10px; /* Espacement intérieur */
        border-radius: 5px; /* Coins arrondis */
    }

    /* Style des liens */
    .link {
        color: white; /* Couleur du texte */
        text-decoration: none; /* Supprimer le soulignement par défaut */
        margin: 5px 0; /* Espacement entre les liens */
        padding: 8px 15px; /* Espacement intérieur */
        border-radius: 3px; /* Coins arrondis */
        transition: background-color 0.3s; /* Transition fluide de la couleur de fond */
    }

    /* Style des liens au survol */
    .link:hover {
        background-color: #555; /* Changement de couleur de fond au survol */
    }

    /* Style pour le titre */
    h1 {
        color: #333; /* Couleur du titre */
        font-family: Arial, sans-serif; /* Police de caractères */
    }
</style>
