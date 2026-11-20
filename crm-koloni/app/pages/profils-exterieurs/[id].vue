<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="mb-4">
      <UButton
        label="Retour aux profils extérieurs"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/profils-exterieurs"
      />
    </div>

    <header class="mb-8">
      <h1 class="text-2xl font-bold text-highlighted">
        Détail du profil extérieur
      </h1>
      <p class="mt-1 text-sm text-muted">
        {{ profil ? `${profil.prenom} ${profil.nom}` : 'Chargement...' }}
      </p>
    </header>

    <UForm
      v-if="profil"
      :state="form"
      class="space-y-5"
      @submit="enregistrer"
    >
      <CarteTitree
        icon="i-lucide-user"
        title="Identité & Contact"
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
            label="Moyen de contact"
            name="moyenContact"
            class="col-span-full"
          >
            <UInput
              v-model="form.moyenContact"
              placeholder="Mail, téléphone, LinkedIn..."
              class="w-full"
            />
          </UFormField>
        </section>
      </CarteTitree>

      <CarteTitree
        icon="i-lucide-code"
        title="Compétences & Expériences"
      >
        <section class="space-y-4">
          <UFormField
            label="Technologies (séparées par une virgule)"
            name="technologies"
          >
            <UInput
              v-model="technologiesInput"
              placeholder="Ex. Python, dbt, Snowflake"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField
              label="Niveau"
              name="niveau"
            >
              <USelect
                v-model="form.niveau"
                :items="['Opérationnel', 'Senior', 'Expert']"
                placeholder="Sélectionner le niveau"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="TJM souhaité (€)"
              name="tjm"
            >
              <UInput
                v-model="form.tjm"
                type="number"
                placeholder="Ex. 550"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField
            label="Expériences clés"
            name="experiencesCles"
          >
            <UTextarea
              v-model="form.experiencesCles"
              :rows="3"
              class="w-full"
            />
          </UFormField>
        </section>
      </CarteTitree>

      <CarteTitree
        icon="i-lucide-calendar"
        title="Localisation & Disponibilité"
      >
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField
            label="Ville"
            name="ville"
          >
            <UInput
              v-model="form.ville"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Disponibilité"
            name="disponibilite"
          >
            <UInput
              v-model="form.disponibilite"
              placeholder="Immédiate, À partir du..."
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
      Profil extérieur introuvable.
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const route = useRoute()
const toast = useToast()

interface ProfilExterieur {
  id: string
  nom: string
  prenom: string
  moyenContact?: string
  technologies: string[]
  niveau?: string
  experiencesCles?: string
  ville?: string
  disponibilite?: string
  tjm?: number
}

const profils = ref<ProfilExterieur[]>([
  {
    id: '1',
    prenom: 'Léa',
    nom: 'Martin',
    moyenContact: 'lea.martin@example.com',
    technologies: ['Python', 'dbt'],
    niveau: 'Senior',
    ville: 'Paris',
    disponibilite: 'Immédiate',
    tjm: 600
  }
])

const profil = computed(() => profils.value.find(p => p.id === route.params.id))

const form = reactive({
  prenom: '',
  nom: '',
  moyenContact: '',
  niveau: undefined as string | undefined,
  experiencesCles: '',
  ville: '',
  disponibilite: '',
  tjm: undefined as number | undefined
})

const technologiesInput = ref('')

watch(profil, (p) => {
  if (p) {
    form.prenom = p.prenom
    form.nom = p.nom
    form.moyenContact = p.moyenContact ?? ''
    form.niveau = p.niveau
    form.experiencesCles = p.experiencesCles ?? ''
    form.ville = p.ville ?? ''
    form.disponibilite = p.disponibilite ?? ''
    form.tjm = p.tjm
    technologiesInput.value = p.technologies.join(', ')
  }
}, { immediate: true })

const enregistrement = ref(false)

async function enregistrer() {
  if (!form.prenom.trim() || !form.nom.trim()) {
    toast.add({ title: 'Le prénom et le nom sont obligatoires.', color: 'error' })
    return
  }
  enregistrement.value = true
  try {
    toast.add({ title: 'Profil mis à jour avec succès', color: 'success' })
  } catch {
    toast.add({ title: 'Erreur lors de la mise à jour', color: 'error' })
  } finally {
    enregistrement.value = false
  }
}
</script>
