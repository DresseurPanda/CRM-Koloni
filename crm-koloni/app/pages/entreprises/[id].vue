<!--
  Fiche d'une entreprise cliente : nom, secteur, taille et ville, modifiables par tout membre
  On y arrive notamment après avoir créé l'entreprise depuis le formulaire d'une opportunité.
-->
<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="mb-4">
      <!-- Pas de liste des entreprises : on revient à la page d'où l'on vient -->
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
        Entreprise cliente
      </h1>
      <p class="mt-1 text-sm text-muted">
        {{ entreprise ? entreprise.nom : 'Chargement...' }}
      </p>
    </header>

    <UForm
      v-if="entreprise"
      :state="form"
      class="space-y-5"
      @submit="enregistrer"
    >
      <CarteTitree
        icon="i-lucide-building-2"
        title="Informations de l'entreprise"
      >
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField
            label="Nom"
            name="nom"
            required
            class="md:col-span-2"
          >
            <UInput
              v-model="form.nom"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Secteur"
            name="secteur"
          >
            <UInput
              v-model="form.secteur"
              placeholder="Ex. Banque, industrie"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Taille"
            name="taille"
          >
            <UInput
              v-model="form.taille"
              placeholder="Ex. PME, grand compte"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Ville"
            name="ville"
          >
            <UInput
              v-model="form.ville"
              placeholder="Ex. Lyon"
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
      Entreprise introuvable.
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { EntrepriseDetail } from '#shared/types/referentiels'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Une entreprise introuvable (404) laisse `entreprise` vide : la page affiche « Entreprise introuvable »
const { data: entreprise, refresh } = await useFetch<EntrepriseDetail>(`/api/entreprises/${route.params.id}`)

const form = reactive({ nom: '', secteur: '', taille: '', ville: '' })

// Recopie la fiche dans le formulaire à chaque lecture (chargement, puis après enregistrement)
watch(entreprise, (valeur) => {
  if (valeur) {
    form.nom = valeur.nom
    form.secteur = valeur.secteur ?? ''
    form.taille = valeur.taille ?? ''
    form.ville = valeur.ville ?? ''
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
    await $fetch(`/api/entreprises/${route.params.id}`, { method: 'PATCH', body: form })
    await refresh()
    toast.add({ title: 'Entreprise mise à jour', color: 'success' })
  } catch (error) {
    const message = (error as { data?: { statusMessage?: string } }).data?.statusMessage
    toast.add({ title: 'Mise à jour impossible', description: message, color: 'error' })
  } finally {
    enregistrement.value = false
  }
}
</script>
