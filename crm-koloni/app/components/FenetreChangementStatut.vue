<!--
  FenetreChangementStatut — fenêtre (UModal) qui fait passer une opportunité à un autre statut
  Transitions libres (saut, retour en arrière, réouverture), avec les champs propres au statut choisi :
  raison de la perte pour Perdu, date de relance pour En pause.
  Props :
    opportunite — fiche de l'opportunité (statut actuel, qualification, champs de signature)
  v-model:open — fenêtre ouverte ou fermée ; « Annuler », Échap ou un clic à côté la ferment
  Émet : modifie une fois le statut enregistré, pour que la page recharge la fiche
-->
<template>
  <UModal
    v-model:open="ouverte"
    title="Changer le statut"
    :description="`Statut actuel : ${opportunite.statut}`"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UForm
        :id="idFormulaire"
        :state="form"
        :validate="valider"
        class="space-y-4"
        @submit="enregistrer"
      >
        <UFormField
          label="Nouveau statut"
          name="statut"
          required
        >
          <USelect
            v-model="form.statut"
            :items="statutsProposes"
            placeholder="Sélectionner un statut"
            class="w-full"
          />
        </UFormField>

        <UFormField
          v-if="form.statut === 'perdu'"
          label="Raison de la perte"
          name="raisonPerte"
          required
        >
          <UTextarea
            v-model="form.raisonPerte"
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <UFormField
          v-if="form.statut === 'en_pause'"
          label="Date de relance"
          name="dateRelance"
          required
        >
          <UInput
            v-model="form.dateRelance"
            type="date"
            class="w-full"
          />
        </UFormField>
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
        label="Enregistrer"
        :loading="enregistrement"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { FormError } from '@nuxt/ui'

type CodeStatut = keyof typeof LIBELLES_STATUT

const props = defineProps<{ opportunite: OpportuniteDetail }>()

const emit = defineEmits<{ modifie: [] }>()

const ouverte = defineModel<boolean>('open', { default: false })

const toast = useToast()
const idFormulaire = useId()

// Seuls statuts qu'une opportunité non qualifiée peut prendre (même règle que la route)
const STATUTS_SANS_QUALIFICATION: CodeStatut[] = ['signal', 'perdu', 'en_pause']

// Champs exigés par la base pour passer en Signé, absents de la fiche
const champsSignatureManquants = computed(() => [
  ...(props.opportunite.preneur ? [] : ['preneur']),
  ...(props.opportunite.tjmPreneur === undefined ? ['TJM preneur'] : []),
  ...(props.opportunite.nombreJours === undefined ? ['nombre de jours'] : [])
])

// Tous les statuts sauf l'actuel ; Signé grisé tant qu'il manque un champ de signature
const statutsProposes = computed(() => {
  const qualifiee = Boolean(props.opportunite.qualifieePar)
  return optionsDe(LIBELLES_STATUT)
    .filter(option => option.value !== props.opportunite.codes.statut)
    .filter(option => qualifiee || STATUTS_SANS_QUALIFICATION.includes(option.value))
    .map((option) => {
      if (option.value !== 'signe' || !champsSignatureManquants.value.length) return option
      return { ...option, disabled: true, description: `Manque : ${champsSignatureManquants.value.join(', ')}` }
    })
})

// Saisie de la fenêtre : statut choisi (code en base), puis les champs propres à Perdu et à En pause
const form = reactive<{ statut?: CodeStatut, raisonPerte: string, dateRelance: string }>({
  statut: undefined,
  raisonPerte: '',
  dateRelance: ''
})

// Formulaire vidé à chaque ouverture, pour ne pas reprendre la saisie d'une fois précédente
watch(ouverte, (valeur) => {
  if (valeur) Object.assign(form, { statut: undefined, raisonPerte: '', dateRelance: '' })
})

// Erreurs affichées sous les champs concernés, avant tout envoi
function valider(etat: typeof form): FormError[] {
  const erreurs: FormError[] = []
  if (!etat.statut) erreurs.push({ name: 'statut', message: 'Choisir un statut' })
  if (etat.statut === 'perdu' && !etat.raisonPerte.trim()) {
    erreurs.push({ name: 'raisonPerte', message: 'La raison de la perte est obligatoire' })
  }
  if (etat.statut === 'en_pause' && !etat.dateRelance) {
    erreurs.push({ name: 'dateRelance', message: 'La date de relance est obligatoire' })
  }
  return erreurs
}

const enregistrement = ref(false)

// N'envoie que le champ propre au statut choisi ; la page recharge la fiche (badge, champs, fil)
async function enregistrer() {
  enregistrement.value = true
  try {
    await $fetch(`/api/opportunites/${props.opportunite.id}/statut`, {
      method: 'PATCH',
      body: {
        statut: form.statut,
        ...(form.statut === 'perdu' ? { raisonPerte: form.raisonPerte.trim() } : {}),
        ...(form.statut === 'en_pause' ? { dateRelance: form.dateRelance } : {})
      }
    })
    emit('modifie')
    ouverte.value = false
    toast.add({ title: 'Statut modifié', color: 'success' })
  } catch (error) {
    const message = (error as { data?: { statusMessage?: string } }).data?.statusMessage
    toast.add({ title: 'Changement de statut impossible', description: message, color: 'error' })
  } finally {
    enregistrement.value = false
  }
}
</script>
