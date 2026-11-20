<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="mb-4">
      <UButton
        :label="opportuniteId ? 'Retour à l\'opportunité' : 'Retour aux contacts'"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        :to="pageRetour"
      />
    </div>

    <header class="mb-8">
      <h1 class="text-2xl font-bold text-highlighted">
        Ajouter un contact
      </h1>
      <p class="mt-1 text-sm text-muted">
        Renseignez les informations du nouveau contact client
      </p>
    </header>

    <UForm
      :state="form"
      class="space-y-5"
      @submit="creerContact"
    >
      <CarteTitree
        icon="i-lucide-user-plus"
        title="Informations du contact"
      >
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField
            label="Prénom"
            name="prenom"
            required
          >
            <UInput
              v-model="form.prenom"
              placeholder="Prénom"
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
              placeholder="Nom"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Poste / Fonction"
            name="role"
          >
            <UInput
              v-model="form.role"
              placeholder="Ex. DSI, Commercial..."
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Entreprise cliente"
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
              placeholder="nom@entreprise.fr"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Téléphone"
            name="telephone"
          >
            <UInput
              v-model="form.telephone"
              placeholder="06 00 00 00 00"
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
          :to="pageRetour"
          variant="ghost"
          color="neutral"
        >
          Annuler
        </UButton>
        <UButton
          type="submit"
          :loading="creation"
          icon="i-lucide-check"
        >
          Créer le contact
        </UButton>
      </footer>
    </UForm>
  </UContainer>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const toast = useToast()

// Arrivée depuis une fiche opportunité (?opportunite=12) : retour sur cette fiche, pour y rattacher le contact
const opportuniteId = computed(() => {
  const valeur = route.query.opportunite
  return typeof valeur === 'string' && /^\d+$/.test(valeur) ? valeur : undefined
})
const pageRetour = computed(() => (opportuniteId.value ? `/opportunites/${opportuniteId.value}` : '/contacts'))

const { data: entreprises } = await useFetch<EntrepriseCliente[]>('/api/entreprises', { default: () => [] })
const entreprisesDisponibles = computed(() => entreprises.value.map(e => ({ label: e.nom, value: e.id })))

const form = reactive({
  prenom: '',
  nom: '',
  role: '',
  entrepriseId: undefined as string | undefined,
  mail: '',
  telephone: '',
  lienLinkedin: ''
})

const creation = ref(false)

async function creerContact() {
  if (!form.prenom.trim() || !form.nom.trim()) {
    toast.add({ title: 'Le prénom et le nom sont obligatoires.', color: 'error' })
    return
  }
  if (!form.mail.trim() && !form.telephone.trim() && !form.lienLinkedin.trim()) {
    toast.add({ title: 'Renseignez au moins un mail, un téléphone ou un lien LinkedIn.', color: 'error' })
    return
  }

  creation.value = true
  try {
    await $fetch('/api/contacts', { method: 'POST', body: form })
    toast.add({
      title: 'Contact créé avec succès',
      description: opportuniteId.value ? 'Vous pouvez maintenant le rattacher avec « Ajouter ».' : undefined,
      color: 'success'
    })
    await router.push(pageRetour.value)
  } catch (error) {
    const message = (error as { data?: { statusMessage?: string } }).data?.statusMessage
    toast.add({ title: 'Création impossible', description: message, color: 'error' })
  } finally {
    creation.value = false
  }
}
</script>
