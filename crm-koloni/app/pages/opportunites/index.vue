<template>
  <UContainer class="py-6">
    <CarteTitree
      icon="i-lucide-briefcase"
      title="Opportunités"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <UInput
            v-model="recherche"
            icon="i-lucide-search"
            placeholder="Recherche"
            class="max-w-xl"
          />
          <UButton
            label="Ajouter une opportunité"
            icon="material-symbols-light:docs-add-on"
            to="/opportunites/nouveau"
            class="justify-center"
          />
        </div>

        <div class="flex flex-wrap items-end justify-between gap-3">
          <div class="flex flex-wrap items-end gap-3">
            <ListeDeroulanteLibellee
              v-for="filtre in FILTRES"
              :key="filtre.cle"
              v-model="filtres[filtre.cle]"
              :label="filtre.label"
              :items="valeursUniques(filtre.valeurs)"
              placeholder="Tous"
            />
            <UFormField label="Date du signal">
              <UInput
                v-model="filtres.dateSignal"
                type="date"
              />
            </UFormField>
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

        <TableauOpportunites
          :opportunites="opportunitesPage"
          :get-badges="getOpportuniteBadges"
          :titre-to="o => `/opportunites/${o.id}`"
        />

        <BarrePagination
          v-model:page="page"
          :total="opportunitesFiltrees.length"
          :items-per-page="ITEMS_PAR_PAGE"
        />
      </div>
    </CarteTitree>
  </UContainer>
</template>

<script setup lang="ts">
const ITEMS_PAR_PAGE = 20

// Filtres de la liste — chaque filtre extrait les valeurs d'une opportunité
const FILTRES = [
  { cle: 'clientFinal', label: 'Client', valeurs: (o: Opportunite) => [o.clientFinal] },
  { cle: 'ville', label: 'Ville', valeurs: (o: Opportunite) => [o.ville] },
  { cle: 'apporteur', label: 'Apporteur', valeurs: (o: Opportunite) => [o.apporteur] },
  { cle: 'statut', label: 'Statut', valeurs: (o: Opportunite) => [o.statut] }
] as const

type Filtres = Partial<Record<typeof FILTRES[number]['cle'] | 'dateSignal', string>>

// Opportunités lues en base de donnée, de la plus récente à la plus ancienne
const { data: opportunites } = await useFetch<Opportunite[]>('/api/opportunites', { default: () => [] })

const { getOpportuniteBadges } = useOpportuniteBadges(opportunites)

const recherche = ref('')
const page = ref(1)

// Les filtres ne s'appliquent qu'au clic sur « Valider »
const filtres = reactive<Filtres>({})
const filtresAppliques = ref<Filtres>({})

function valeursUniques(get: (o: Opportunite) => (string | undefined)[]) {
  return [...new Set(opportunites.value.flatMap(get).filter(Boolean) as string[])].sort()
}

const opportunitesFiltrees = computed(() => {
  const terme = recherche.value.trim().toLowerCase()
  const actifs = filtresAppliques.value
  return opportunites.value.filter(o =>
    (!terme || [o.titre, o.clientFinal, o.apporteur].some(v => v?.toLowerCase().includes(terme)))
    && FILTRES.every(f => !actifs[f.cle] || (f.valeurs(o) as (string | undefined)[]).includes(actifs[f.cle]))
    && (!actifs.dateSignal || o.dateSignal === actifs.dateSignal)
  )
})

const opportunitesPage = computed(() =>
  opportunitesFiltrees.value.slice((page.value - 1) * ITEMS_PAR_PAGE, page.value * ITEMS_PAR_PAGE)
)

function valider() {
  filtresAppliques.value = { ...filtres }
  page.value = 1
}

function reinitialiser() {
  for (const cle of Object.keys(filtres) as (keyof Filtres)[]) filtres[cle] = undefined
  recherche.value = ''
  valider()
}
</script>
