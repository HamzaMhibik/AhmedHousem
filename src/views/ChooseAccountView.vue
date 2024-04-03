<template>
  <div class="container">
    <div class="section-grid">
      <section class="section">
        <h2>Pour les Propriétaires de <br>Terrains</h2>
        <p>
          -Enregistrez votre stade.<br>
          -Gérez les réservations.<br>
          -Cree des tournois.<br>
          -Rejoignez notre réseau de passionnés de football.
        </p>
        <a class="cta-button" @click="creeProprietaire">Inscrivez votre stade</a>
      </section>
      
      <section class="section">
        <h2>Pour les Capitaines <br>d'Équipe.</h2>
        <p>
          -Créez un compte pour votre équipe.<br>
          -Explorez les stades disponibles.<br>
          -Rréservez des matchs.<br>
          -Participez à des tournois excitants.<br>
          -Personalisez et modifiez le compte de votre equipe.<br>
          -Defier d'autre equipes.<br>
          -Mettre de demandes de recrutement de joueures.<br>
          -Donner des note au stade.<br>
          -Donner votre avis pour chaque stade en laissant un commentaire .<br>
        </p>
        <a class="cta-button" @click="creeEquipe">Créez votre équipe</a>
      </section>
      
      <section class="section">
        <h2>Pour les Joueurs en Recherche d'Équipe</h2>
        <p>
          -Créez un compte joueur pour trouver un équipe.<br>
          -Accès aux demandes de recrutement des équipes avec la possibilite de postule.<br>
          -Accès au catalogue des stades et au catalogue des tournois.
        </p>
        <a class="cta-button" @click="creeJoueur">Rejoignez une équipe</a>
      </section>
    </div>
  </div>
</template>
  <script>
  export default {
    methods: {
      creeProprietaire() {
        this.$router.push({ path: '/account', query: { type: 'proprietaire' }});
      },
      creeEquipe() {
        this.$router.push({ path: '/account', query: { type: 'equipe' }});
      },
      creeJoueur() {
        this.$router.push({ path: '/account', query: { type: 'joueur' }});
      }
    }
  }
  </script>
  <style  scoped>
      header {
        background-color: #333;
        color: #fff;
        padding: 20px 0;
        text-align: center;
      }
      .container {
        max-width: 1200px;
        margin: auto;
        padding: 20px;
      }
      .section {
        margin-bottom: 40px;
      }
      .section h2 {
        color: #333;
        border-bottom: 2px solid #333;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }
      .section p {
        line-height: 1.6;
      }
      .footer {
        background-color: #333;
        color: #fff;
        text-align: center;
        padding: 10px 0;
        position: fixed;
        bottom: 0;
        width: 100%;
      }
      .cta-button {
        display: inline-block;
        background-color: #ff6f61;
        color: #fff;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        transition: background-color 0.3s ease;
      }
      .cta-button:hover {
        background-color: #e65042;
      }
      .section-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px; /* Espace entre les colonnes */
}
      </style>