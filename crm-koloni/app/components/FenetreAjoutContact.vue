<!--
  FenetreAjoutContact — fenêtre (UModal) qui rattache un contact existant à une opportunité
  Recherche parmi les contacts (nom, poste ou entreprise), sans ceux déjà rattachés,
  et lien vers la création d'un contact qui ramène ensuite sur la fiche.
  Props :
    opportunite — fiche de l'opportunité (identifiant et contacts déjà rattachés)
  v-model:open — fenêtre ouverte ou fermée ; « Annuler », Échap ou un clic à côté la ferment
  Émet : modifie une fois le contact rattaché, pour que la page recharge la fiche
-->
<template>
  <UModal
    v-model:open="ouverte"
    title="Ajouter un contact"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UForm
        :id="idFormulaire"
        :state="form"
        :validate="valider"
        class="space-y-4"
        @submit="rattacher"
      >
        <UFormField
          label="Contact"
          name="contactId"
          required
        >
          <USelectMenu
            v-model="form.contactId"
            :items="contactsProposes"
            value-key="id"
            :filter-fields="['label', 'description']"
            placeholder="Rechercher un contact"
            :loading="chargement"
            class="w-full"
          />
        </UFormField>

        <p class="text-sm text-muted">
          Contact absent de la liste ?
          <ULink
            :to="`/contacts/nouveau?opportunite=${opportunite.id}`"
            class="font-medium"
          >
            Créer un nouveau contact
          </ULink>
        </p>
      </UForm>
    </template>

    <template #footer>
      <UButton
        label="Annuler"
        color="neutral"
        variant="outline"
        @click="ouverte = false"
      />
      <!-- Bouton hors du formulaire (pied de la fenêtre) : relié à lui par l'attribut form -->
      <UButton
        type="submit"
        :form="idFormulaire"
        label="Rattacher"
        :loading="enregistrement"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { FormError } from '@nuxt/ui'

const props = defineProps<{ opportunite: OpportuniteDetail }>()

const emit = defineEmits<{ modifie: [] }>()

const ouverte = defineModel<boolean>('open', { default: false })

const toast = useToast()
const idFormulaire = useId()

// Contacts chargés à l'ouverture seulement, pour inclure ceux créés depuis l'affichage de la fiche
const { data: contacts, pending: chargement, execute: chargerContacts } = useFetch<Contact[]>('/api/contacts', {
  default: () => [],
  immediate: false,
  server: false
})

// Contacts pas encore rattachés : nom en libellé, poste et entreprise en description (cherchés aussi)
const contactsProposes = computed(() => {
  const rattaches = new Set(props.opportunite.contacts.map(c => c.id))
  return contacts.value
    .filter(c => !rattaches.has(c.id))
    .map(c => ({
      id: c.id,
      label: `${c.prenom} ${c.nom}`,
      description: [c.role, c.entreprise].filter(Boolean).join(' — ') || undefined
    }))
})

const form = reactive<{ contactId?: string }>({ contactId: undefined })

// À chaque ouverture : choix vidé et liste rechargée
watch(ouverte, (valeur) => {
  if (!valeur) return
  form.contactId = undefined
  chargerContacts()
})

function valider(etat: typeof form): FormError[] {
  return etat.contactId ? [] : [{ name: 'contactId', message: 'Choisir un contact' }]
}

const enregistrement = ref(false)

// Rattachement enregistré : la page recharge la fiche (carte des contacts et fil)
async function rattacher() {
  enregistrement.value = true
  try {
    await $fetch(`/api/opportunites/${props.opportunite.id}/contacts`, {
      method: 'POST',
      body: { contactId: form.contactId }
    })
    emit('modifie')
    ouverte.value = false
    toast.add({ title: 'Contact rattaché', color: 'success' })
  } catch (error) {
    const message = (error as { data?: { statusMessage?: string } }).data?.statusMessage
    toast.add({ title: 'Rattachement impossible', description: message, color: 'error' })
  } finally {
    enregistrement.value = false
  }
}
</script>
