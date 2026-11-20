<!--
  BarrePagination — barre de pagination centrée
  Props :
    total        — nombre total d'éléments à paginer
    itemsPerPage — nombre d'éléments affichés par page
  v-model:page — page courante (commence à 1)
-->
<template>
  <div class="flex justify-center">
    <UPagination
      v-model:page="page"
      :total="total"
      :items-per-page="itemsPerPage"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  total: number
  itemsPerPage: number
}>()

const page = defineModel<number>('page', { required: true })
</script>
