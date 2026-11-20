<!--
  ListeDeroulanteLibellee — liste déroulante (USelect) précédée d'un libellé
  Sa largeur s'adapte à l'option la plus longue, placeholder compris.
  Props :
    label       — libellé affiché au-dessus de la liste
    items       — options : chaînes, ou objets { label, value }
    placeholder — texte affiché quand rien n'est sélectionné (optionnel)
  v-model — valeur sélectionnée
-->
<template>
  <UFormField
    :label="label"
    class="min-w-0 max-w-full"
    :ui="{ label: 'whitespace-nowrap' }"
  >
    <!-- Grille 1×1 : le gabarit invisible et le USelect occupent la même cellule,
         qui prend donc la largeur de l'option la plus longue -->
    <div class="grid">
      <!-- pl-3 pr-10 : mêmes marges que le USelect (dont la place de la flèche) -->
      <span
        aria-hidden="true"
        class="invisible col-start-1 row-start-1 sm:whitespace-nowrap text-sm pl-3 pr-10"
      >{{ longestLabel }}</span>
      <USelect
        v-model="modelValue"
        :items="items"
        :placeholder="placeholder"
        class="col-start-1 row-start-1 w-full"
      />
    </div>
  </UFormField>
</template>

<script lang="ts" setup>
const props = defineProps<{
  label: string
  items: (string | { label: string, value: string })[]
  placeholder?: string
}>()

const modelValue = defineModel<string>()

// Libellé le plus long parmi les options et le placeholder : sert de gabarit au span invisible
const longestLabel = computed(() => {
  const labels = props.items.map(item => typeof item === 'string' ? item : item.label)
  if (props.placeholder) labels.push(props.placeholder)
  return labels.reduce((max, l) => l.length > max.length ? l : max, '')
})
</script>
