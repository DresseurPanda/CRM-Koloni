<!--
  CarteTitree — carte UCard avec un en-tête standard (icône + titre)
  Props :
    icon  — nom de l'icône Iconify (ex. 'i-lucide-users')
    title — titre affiché dans l'en-tête
  Slot par défaut : contenu de la carte
  Slot actions (optionnel) : boutons alignés à droite de l'en-tête
-->
<template>
  <UCard>
    <template #header>
      <header class="flex items-center gap-2">
        <UIcon
          :name="icon"
          class="size-4 text-primary"
        />
        <h2 class="font-semibold text-highlighted">
          {{ title }}
        </h2>
        <div
          v-if="$slots.actions"
          class="ms-auto flex items-center gap-2"
        >
          <slot name="actions" />
        </div>
      </header>
    </template>
    <slot />
  </UCard>
</template>

<script lang="ts" setup>
defineProps<{
  icon: string
  title: string
}>()
</script>
