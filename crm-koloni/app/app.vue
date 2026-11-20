<template>
  <!-- Textes des composants Nuxt UI en français (« Créer … », « Aucun résultat »…) -->
  <UApp :locale="fr">
    <MenuApplication />
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
import { fr } from '@nuxt/ui/locale'
</script>
