<template>
  <UContainer class="py-6">
    <CarteTitree
      icon="i-lucide-users"
      title="Contacts"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <UInput
            v-model="recherche"
            icon="i-lucide-search"
            placeholder="Recherche"
            class="max-w-xl w-full"
          />

          <UButton
            label="Ajouter un contact"
            icon="i-lucide-user-plus"
            to="/contacts/nouveau"
            class="justify-center"
          />
        </div>

        <div class="flex flex-wrap items-end justify-between gap-3">
          <ListeDeroulanteLibellee
            v-model="entreprise"
            label="Entreprise"
            :items="entreprises"
            placeholder="Toutes"
          />
          <div class="flex gap-2">
            <UButton
              label="Réinitialiser"
              color="neutral"
              variant="outline"
              @click="reinitialiser"
            />
            <UButton
              label="Valider"
              @click="valider"
            />
          </div>
        </div>

        <UTable
          :data="contactsFiltres"
          :columns="columns"
        >
          <template #details-cell="{ row }">
            <UButton
              label="Détails"
              trailing-icon="i-lucide-external-link"
              color="neutral"
              variant="outline"
              size="xs"
              :to="`/contacts/${row.original.id}`"
            />
          </template>
        </UTable>
      </div>
    </CarteTitree>
  </UContainer>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const { data: contacts } = await useFetch<Contact[]>('/api/contacts', { default: () => [] })

const columns: TableColumn<Contact>[] = [
  { id: 'nomComplet', header: 'Nom et Prénom', accessorFn: c => `${c.prenom} ${c.nom}` },
  { accessorKey: 'entreprise', header: 'Entreprise' },
  { accessorKey: 'role', header: 'Poste' },
  { id: 'details', header: 'Détails' }
]

const recherche = ref('')
const entreprise = ref<string>()
const entrepriseAppliquee = ref<string>()

const entreprises = computed(() => [...new Set(contacts.value.map(c => c.entreprise).filter(Boolean) as string[])].sort())

// Les filtres ne s'appliquent qu'au clic sur « Valider »
const contactsFiltres = computed(() => {
  const terme = recherche.value.trim().toLowerCase()
  return contacts.value.filter(c =>
    (!terme || [c.nom, c.prenom, c.entreprise, c.role].some(v => v?.toLowerCase().includes(terme)))
    && (!entrepriseAppliquee.value || c.entreprise === entrepriseAppliquee.value)
  )
})

function valider() {
  entrepriseAppliquee.value = entreprise.value
}

function reinitialiser() {
  recherche.value = ''
  entreprise.value = undefined
  valider()
}
</script>
