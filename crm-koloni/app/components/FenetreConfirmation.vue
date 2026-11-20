<!--
  FenetreConfirmation — fenêtre (UModal) qui demande de confirmer une action avant de la lancer
  Props :
    title        — titre de la fenêtre (ex. 'Confirmer le retrait')
    description  — question posée (optionnel, ex. « Retirer Camille Démo de « Positionnements » ? »)
    confirmLabel — texte du bouton de validation ; défaut : 'Confirmer'
    color        — couleur du bouton de validation : NuxtUiColor, défaut 'error' (action à risque)
  v-model:open — fenêtre ouverte ou fermée ; « Annuler », Échap ou un clic à côté la ferment
  Émet : confirmer au clic sur le bouton de validation, puis la fenêtre se ferme
-->
<template>
  <UModal
    v-model:open="ouverte"
    :title="title"
    :description="description"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton
        label="Annuler"
        color="neutral"
        variant="outline"
        @click="ouverte = false"
      />
      <UButton
        :label="confirmLabel"
        :color="color"
        @click="confirmer"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
// Props détaillées dans l'en-tête ; par défaut : pas de description, bouton « Confirmer » rouge
withDefaults(defineProps<{
  title: string
  description?: string
  confirmLabel?: string
  color?: NuxtUiColor
}>(), {
  description: undefined,
  confirmLabel: 'Confirmer',
  color: 'error'
})

// « confirmer » prévient la page que l'action est validée ; c'est elle qui la lance
const emit = defineEmits<{ confirmer: [] }>()

// Fenêtre ouverte ou fermée, liée à la page par v-model:open
const ouverte = defineModel<boolean>('open', { default: false })

// Clic sur le bouton de validation : prévient la page, puis ferme la fenêtre
function confirmer() {
  emit('confirmer')
  ouverte.value = false
}
</script>
