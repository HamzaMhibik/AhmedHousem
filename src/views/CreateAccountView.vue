<template>
    <div v-if="typeCreation==='equipe'"><formEquipe></formEquipe></div>
    <div v-if="typeCreation==='proprietaire'"><formPrp></formPrp></div>
    <div v-if="typeCreation==='joueur'"><formJoueur></formJoueur></div>
</template>
<script>
    import formPrp from '@/components/creation/FormulaireProprietaire.vue'
    import formEquipe from '@/components/creation/FormulaireEquipe.vue'
    import formJoueur from '@/components/creation/FormulaireJoueur.vue'
    export default{
        name:'',
        components:{
            formPrp,
            formEquipe,
            formJoueur
        },
        data (){
            return{
                typeCreation: null
            }
        },
        created() {
            this.typeCreation = this.$route.query.type;
        }
    }
</script>