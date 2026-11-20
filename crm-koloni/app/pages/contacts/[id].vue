<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="mb-4">
      <UButton
        label="Retour aux contacts"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/contacts"
      />
    </div>

    <header class="mb-8">
      <h1 class="text-2xl font-bold text-highlighted">
        Détail du contact
      </h1>
      <p class="mt-1 text-sm text-muted">
        {{ contact ? `${contact.prenom} ${contact.nom}` : 'Chargement...' }}
      </p>
    </header>

    <UForm
      v-if="contact"
      :state="form"
      class="space-y-5"
      @submit="enregistrer"
    >
      <CarteTitree
        icon="i-lucide-user"
        title="Informations générales"
      >
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField
            label="Prénom"
            name="prenom"
            required
          >
            <UInput
              v-model="form.prenom"
              class="w-full"
            />
          </UFormField>

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
            label="Poste / Fonction"
            name="role"
          >
            <UInput
              v-model="form.role"
              placeholder="Ex. Commercial"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Entreprise"
            name="entreprise"
          >
            <USelect
              v-model="form.entrepriseId"
              :items="entreprisesDisponibles"
              placeholder="Sélectionner une entreprise"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Adresse email"
            name="mail"
          >
            <UInput
              v-model="form.mail"
              type="email"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Téléphone"
            name="telephone"
          >
            <UInput
              v-model="form.telephone"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Lien LinkedIn"
            name="lienLinkedin"
            description="Au moins un mail, un téléphone ou un lien LinkedIn"
            class="col-span-full"
          >
            <UInput
              v-model="form.lienLinkedin"
              placeholder="https://www.linkedin.com/in/..."
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
      Contact introuvable.
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const route = useRoute()
const toast = useToast()

// Un contact introuvable (404) laisse `contact` vide : la page affiche « Contact introuvable »
const { data: contact, refresh } = await useFetch<Contact>(`/api/contacts/${route.params.id}`)
const { data: entreprises } = await useFetch<EntrepriseCliente[]>('/api/entreprises', { default: () => [] })

// Choix qui retire l'entreprise du contact
const AUCUNE_ENTREPRISE = 'aucune'
const entreprisesDisponibles = computed(() => [
  { label: 'Aucune entreprise', value: AUCUNE_ENTREPRISE },
  ...entreprises.value.map(e => ({ label: e.nom, value: e.id }))
])

const form = reactive({
  prenom: '',
  nom: '',
  role: '',
  entrepriseId: AUCUNE_ENTREPRISE,
  mail: '',
  telephone: '',
  lienLinkedin: ''
})

watch(contact, (val) => {
  if (val) {
    form.prenom = val.prenom
    form.nom = val.nom
    form.role = val.role ?? ''
    form.entrepriseId = val.entrepriseId ?? AUCUNE_ENTREPRISE
    form.mail = val.mail ?? ''
    form.telephone = val.telephone ?? ''
    form.lienLinkedin = val.lienLinkedin ?? ''
  }
}, { immediate: true })

const enregistrement = ref(false)

async function enregistrer() {
  if (!form.prenom.trim() || !form.nom.trim()) {
    toast.add({ title: 'Le prénom et le nom sont obligatoires.', color: 'error' })
    return
  }
  if (!form.mail.trim() && !form.telephone.trim() && !form.lienLinkedin.trim()) {
    toast.add({ title: 'Renseignez au moins un mail, un téléphone ou un lien LinkedIn.', color: 'error' })
    return
  }
  enregistrement.value = true
  try {
    await $fetch(`/api/contacts/${route.params.id}`, {
      method: 'PATCH',
      body: { ...form, entrepriseId: form.entrepriseId === AUCUNE_ENTREPRISE ? null : form.entrepriseId }
    })
    await refresh()
    toast.add({ title: 'Contact mis à jour avec succès', color: 'success' })
  } catch (error) {
    const message = (error as { data?: { statusMessage?: string } }).data?.statusMessage
    toast.add({ title: 'Mise à jour impossible', description: message, color: 'error' })
  } finally {
    enregistrement.value = false
  }
}
</script>
