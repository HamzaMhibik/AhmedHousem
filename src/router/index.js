import mainView from'../App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import listequipes from '../views/listesequipes.vue'
//---------------------------------Creation-----------------------------
import ChooseAccountView from '../views/ChooseAccountView.vue'
import CreateAccount from '../views/CreateAccountView.vue'
import Password from '../views/Password.vue'
//---------------------------------coonection-----------------------------
import verificationemail from '../views/emailVerification.vue'
import seConnecter2 from '../views/seConnecter2'
//---------------------------------Joueure-----------------------------
import compteJoueure from '../components/joueure/monCompte.vue'
import pagededemande from '../components/joueure/demande.vue'
//---------------------------------equipe-----------------------------
import compteEquipe from '../components/equipe/compteEquipe.vue'
import pageStade from '../components/equipe/stades.vue'
import pagetournoi from '../components/equipe/tournoi.vue'
import Recrutement from '../components/equipe/Recrutement.vue'
import Reserver from '../components/equipe/reserver.vue'
import participer from '../components/equipe/participer.vue'
import mesrecrutement from '../components/equipe/MesRecrutement.vue'
import defierEquipe from '../components/equipe/defis/defierEquipe.vue'
import defiscree from '../components/equipe/defis/defiscree.vue'
import defispropose from '../components/equipe/defis/defispropose.vue'

//---------------------------------stade-----------------------------
import compteStade from '../components/terrain/compteStade.vue'
import creeTournoi from '../components/terrain/creetournoi.vue'
import emploi from '../components/terrain/emploi.vue'
import MesTournoi from '../components/terrain/MesTournoi.vue'
import Tournoi from '../components/terrain/tournoi.vue'

//---------------------------------Admin-----------------------------
import Admin from '../components/admin/admin.vue'
import Dashboard from '../components/admin/dashboard.vue'
import commentaires from '../components/admin/commentaires.vue'
import defisadmin from '../components/admin/defis.vue'
import equipes from '../components/admin/equipes.vue'
import joueurs from '../components/admin/joueurs.vue'
import recrutements from '../components/admin/recrutements.vue'
import stades from '../components/admin/stades.vue'
import tournois from '../components/admin/tournois.vue'









const routes = [
  {
    name:'mainVue',
    path:('/main'),
    component: mainView
  },
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path:'/create',
    name:'Create',
    component:ChooseAccountView
  },
  {
    path:'/account',
    component:CreateAccount
  },
  {
    name:'verificationemail',
    path:'/vericationemail',
    component:verificationemail
  },{
    name:'seConnecter2',
    path:'/seConnecter2',
    component:seConnecter2
  },
  {
    name:'listeEquipes',
    path:'/listequipes',
    component:listequipes
  },
  {
    name:'Password',
    path:'/password',
    component:Password
  },
  
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  //---------------------------------------------------------------------------------------
  //----------------------------JOUEURE-------------------------------
  {
    name: 'comptejoueur',
    path: '/comptejoueur',
    component: compteJoueure
  },
  {
    name:'pageDemande',
    path:'/demande',
    component:pagededemande
  },
  //--------------------------- Equipe-----------------------------------
  {
    name:'compteEquipe',
    path:'/compteEquipe',
    component:compteEquipe
  },
  {
    name:'pageStade',
    path:'/stade',
    component:pageStade
  },
  {
    name:'pagetournoi',
    path:'/tournoi',
    component:pagetournoi
  },
  {
    name:'recrutement',
    path:'/recrutement',
    component:Recrutement
  },
  {
    name:'server',
    path:'/reserver',
    component:Reserver
  },
  {
    name:'participer',
    path:'/participer',
    component: participer
  },
  {
    name:'mesrecrutement',
    path:'/mesrecrutement',
    component: mesrecrutement
  },
  {
    name:'defierEquipe',
    path:'/defierEquipe',
    component:defierEquipe
  },
  {
    name:'defispropose',
    path:'/defispropose',
    component:defispropose
  },
  {
    name:'defiscree',
    path:'/defiscree',
    component:defiscree
  },
  //----------------------------Terrain-----------------------------------
  {
    name:'monStade',
    path:'/compteStade',
    component:compteStade
  },
  {
    name:'creetournoi',
    path:'/creetournoi',
    component:creeTournoi
  },
  {
    name:'emploi',
    path:'/emploi',
    component:emploi
  },
  {
    name:'MesTournois',
    path:'/MesTournois',
    component:MesTournoi
  },
  {
    name:'Tournois',
    path:'/Tournois1',
    component:Tournoi
  },
  //----------------------------Admin-----------------------------------
  {
    name:'Admin',
    path:'/admin',
    component:Admin
  },
  {
    name:'dashboard',
    path:'/dashboard',
    component:Dashboard
  },
  {
    name:'commentaires',
    path:'/commentaires',
    component:commentaires
  },
  {
    name:'defis',
    path:'/defis',
    component:defisadmin
  },
  {
    name:'equipes',
    path:'/equipes',
    component:equipes
  },
  {
    name:'joueurs',
    path:'/joueurs',
    component:joueurs
  },
  {
    name:'recrutements',
    path:'/recrutements',
    component:recrutements
  },
  {
    name:'stades',
    path:'/stades',
    component:stades
  },
  {
    name:'tournois',
    path:'/tournois',
    component:tournois
  }
]
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})


export default router
