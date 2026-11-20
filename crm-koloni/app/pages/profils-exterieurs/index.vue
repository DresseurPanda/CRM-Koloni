<template>
  <UContainer class="py-6">
    <CarteTitree
      icon="i-lucide-user-search"
      title="Profils extérieurs"
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
            label="Ajouter un profil"
            icon="i-lucide-user-plus"
            to="/profils-exterieurs/nouveau"
            class="justify-center"
          />
        </div>

        <div class="flex flex-wrap items-end justify-between gap-3">
          <div class="flex flex-wrap items-end gap-3">
            <ListeDeroulanteLibellee
              v-model="filtres.technologie"
              label="Technologies"
              :items="valeursUniques(p => p.technologies)"
              placeholder="Toutes"
            />
            <UFormField label="Disponibilité">
              <UInput
                v-model="filtres.disponibilite"
                placeholder="Ex. immédiate"
              />
            </UFormField>
            <ListeDeroulanteLibellee
              v-model="filtres.ville"
              label="Ville"
              :items="valeursUniques(p => [p.ville])"
              placeholder="Toutes"
            />
          </div>
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
          :data="profilsFiltres"
          :columns="columns"
        >
          <template #details-cell="{ row }">
            <UButton
              label="Détails"
              trailing-icon="i-lucide-external-link"
              color="neutral"
              variant="outline"
              size="xs"
              :to="`/profils-exterieurs/${row.original.id}`"
            />
          </template>
        </UTable>
      </div>
    </CarteTitree>
  </UContainer>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface Filtres {
  technologie?: string
  disponibilite?: string
  ville?: string
}

// Profils lus en base de donnée, du plus récemment sollicité au plus ancien
const { data: profils } = await useFetch<ProfilExterieurListe[]>('/api/profils-exterieurs', { default: () => [] })

const columns = computed<TableColumn<ProfilExterieurListe>[]>(() => [
  { id: 'nomComplet', header: 'Nom et Prénom', accessorFn: p => `${p.prenom} ${p.nom}` },
  { id: 'technologies', header: 'Technologies', accessorFn: p => p.technologies.join(', ') },
  { accessorKey: 'disponibilite', header: 'Disponibilité' },
  { accessorKey: 'ville', header: 'Ville' },
  {
    id: 'dateSollicitation',
    header: 'Date de sollicitation',
    // Vide pour un profil jamais sollicité
    accessorFn: p => formaterDate(p.dateSollicitation)
  },
  { id: 'details', header: 'Détails' }
])

const recherche = ref('')
const filtres = reactive<Filtres>({})
const filtresAppliques = ref<Filtres>({})

function valeursUniques(get: (p: ProfilExterieurListe) => (string | undefined)[]) {
  return [...new Set(profils.value.flatMap(get).filter(Boolean) as string[])].sort()
}

// Les filtres ne s'appliquent qu'au clic sur « Valider »
const profilsFiltres = computed(() => {
  const terme = recherche.value.trim().toLowerCase()
  const { technologie, disponibilite, ville } = filtresAppliques.value
  return profils.value.filter(p =>
    (!terme || [p.nom, p.prenom, ...p.technologies].some(v => v.toLowerCase().includes(terme)))
    && (!technologie || p.technologies.includes(technologie))
    && (!disponibilite || p.disponibilite?.toLowerCase().includes(disponibilite.trim().toLowerCase()))
    && (!ville || p.ville === ville)
  )
})

function valider() {
  filtresAppliques.value = { ...filtres }
}

function reinitialiser() {
  recherche.value = ''
  Object.assign(filtres, { technologie: undefined, disponibilite: undefined, ville: undefined })
  valider()
}
</script>
