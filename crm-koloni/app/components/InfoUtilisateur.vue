<!--
  InfoUtilisateur — nom et rôle de l'utilisateur connecté (affiché dans le menu)
  Aucune prop : l'utilisateur est lu via useAuth()
-->
<template>
  <div class="text-sm font-medium">
    {{ nomComplet }} <span class="text-muted">({{ libelleRole }})</span>
  </div>
</template>

<script lang="ts" setup>
const { user, isAdmin } = useAuth()

// Repli si la session ne contient pas encore d'utilisateur
const nomComplet = computed(() => user.value ? `${user.value.prenom} ${user.value.nom}` : 'Utilisateur inconnu')

const libelleRole = computed(() => isAdmin.value ? 'Administrateur' : 'Membre')
</script>
