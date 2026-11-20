<!--
  Fiche d'une technologie : son nom et sa famille (ETL, BI…), qui sert au filtre par domaine
  On y arrive notamment après avoir créé la technologie depuis le formulaire d'une opportunité.
-->
<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="mb-4">
      <!-- Pas de liste des technologies : on revient à la page d'où l'on vient -->
      <UButton
        label="Retour"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        @click="router.back()"
      />
    </div>

    <header class="mb-8">
      <h1 class="text-2xl font-bold text-highlighted">
        Technologie
      </h1>
      <p class="mt-1 text-sm text-muted">
        {{ technologie ? technologie.nom : 'Chargement...' }}
      </p>
    </header>

    <UForm
      v-if="technologie"
      :state="form"
      class="space-y-5"
      @submit="enregistrer"
    >
      <CarteTitree
        icon="i-lucide-code"
        title="Informations de la technologie"
      >
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField
            label="Nom"
            name="nom"
            required
          >
            <UInput
              v-model="form.nom"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Famille"
            name="familleId"
            help="Sert au filtre des opportunités par domaine."
          >
            <USelect
              v-model="form.familleId"
              :items="famillesDisponibles"
              placeholder="Sélectionner une famille"
              class="w-full"
            />
          </UFormField>
        </section>
      </CarteTitree>

      <footer class="flex items-center justify-end gap-3 pt-4">
        <UButton
          type="submit"
          :loading="enregistrement"
          icon="i-lucide-save"
        >
          Enregistrer les modifications
        </UButton>
      </footer>
    </UForm>

    <div
      v-else
      class="text-muted py-4"
    >
      Technologie introuvable.
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { FamilleTechnologie, TechnologieDetail } from '#shared/types/referentiels'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Une technologie introuvable (404) laisse `technologie` vide : la page affiche « Technologie introuvable »
const { data: technologie, refresh } = await useFetch<TechnologieDetail>(`/api/technologies/${route.params.id}`)
const { data: familles } = await useFetch<FamilleTechnologie[]>('/api/familles-technologie', { default: () => [] })

// Choix qui retire la technologie de sa famille
const AUCUNE_FAMILLE = 'aucune'
const famillesDisponibles = computed(() => [
  { label: 'Aucune famille', value: AUCUNE_FAMILLE },
  ...familles.value.map(f => ({ label: f.nom, value: f.id }))
])

const form = reactive({ nom: '', familleId: AUCUNE_FAMILLE })

// Recopie la fiche dans le formulaire à chaque lecture (chargement, puis après enregistrement)
watch(technologie, (valeur) => {
  if (valeur) {
    form.nom = valeur.nom
    form.familleId = valeur.familleId ?? AUCUNE_FAMILLE
  }
}, { immediate: true })

const enregistrement = ref(false)

async function enregistrer() {
  if (!form.nom.trim()) {
    toast.add({ title: 'Le nom est obligatoire.', color: 'error' })
    return
  }
  enregistrement.value = true
  try {
    await $fetch(`/api/technologies/${route.params.id}`, {
      method: 'PATCH',
      body: { nom: form.nom, familleId: form.familleId === AUCUNE_FAMILLE ? null : form.familleId }
    })
    await refresh()
    toast.add({ title: 'Technologie mise à jour', color: 'success' })
  } catch (error) {
    const message = (error as { data?: { statusMessage?: string } }).data?.statusMessage
    toast.add({ title: 'Mise à jour impossible', description: message, color: 'error' })
  } finally {
    enregistrement.value = false
  }
}
</script>
