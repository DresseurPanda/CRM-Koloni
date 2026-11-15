<template>
  <UContainer class="py-6">
    <CarteTitree
      icon="i-lucide-shield"
      :title="titre"
    >
      <div class="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 mb-6">
        <UFormField
          label="Compte"
          class="max-w-xl w-full"
        >
          <USelect
            v-model="idSelectionne"
            :items="comptesDisponibles"
            placeholder="Choisir un compte"
            class="w-full"
          />
        </UFormField>

        <UButton
          label="Ajouter un membre"
          icon="i-lucide-user-plus"
          to="/comptes/nouveau"
          class="justify-center"
        />
      </div>

      <div class="flex max-w-xl flex-col gap-6">
        <template v-if="compteSelectionne">
          <UAlert
            v-if="estMonCompte"
            color="info"
            variant="subtle"
            icon="i-lucide-info"
            title="Vous ne pouvez pas modifier votre propre compte."
          />
          <URadioGroup
            v-model="role"
            legend="Rôle"
            :items="rolesDisponibles"
            :disabled="estMonCompte"
          />
          <URadioGroup
            v-model="actif"
            legend="État du compte"
            :items="etatsDisponibles"
            :disabled="estMonCompte"
          />
          <div>
            <UButton
              label="Enregistrer"
              icon="i-lucide-save"
              :loading="enregistrement"
              :disabled="estMonCompte"
              @click="enregistrer"
            />
          </div>
        </template>
      </div>
    </CarteTitree>
  </UContainer>
</template>

<script setup lang="ts">
import { Role } from '#shared/types/utilisateur'

interface Compte {
  id: string
  nom: string
  prenom: string
  mail: string
  role: Role
  actif: boolean
}

const rolesDisponibles = [
  { label: 'Administrateur', value: Role.admin },
  { label: 'Membre', value: Role.membre }
]

const etatsDisponibles = [
  { label: 'Activer', value: true },
  { label: 'Désactiver', value: false }
]

const toast = useToast()
const { user } = useAuth()
const { data: comptes, refresh } = await useFetch<Compte[]>('/api/comptes', { default: () => [] })

const comptesDisponibles = computed(() => comptes.value.map(c => ({
  label: `${c.prenom} ${c.nom} (${c.mail})${c.actif ? '' : ' : désactivé'}`,
  value: c.id
})))

const idSelectionne = ref<string>()
const compteSelectionne = computed(() => comptes.value.find(c => c.id === idSelectionne.value))
const estMonCompte = computed(() => compteSelectionne.value?.id === user.value?.id)
const titre = computed(() => compteSelectionne.value
  ? `Paramètres du compte : ${compteSelectionne.value.prenom} ${compteSelectionne.value.nom.charAt(0)}.`
  : 'Paramètres du compte')

const role = ref<Role>(Role.membre)
// Désactiver un compte ne supprime jamais la ligne : les traces du membre sont conservées
const actif = ref(true)
const enregistrement = ref(false)

// Recopie le rôle et l'état du compte choisi dans le formulaire
watch(compteSelectionne, (compte) => {
  if (!compte) return
  role.value = compte.role
  actif.value = compte.actif
}, { immediate: true })

async function enregistrer() {
  if (!compteSelectionne.value) return
  enregistrement.value = true
  try {
    // Cast en string : sinon TypeScript confond l'URL avec les routes fixes /api/comptes/compteurs (GET seulement)
    await $fetch(`/api/comptes/${compteSelectionne.value.id}` as string, {
      method: 'PATCH',
      body: { role: role.value, actif: actif.value }
    })
    await refresh()
    toast.add({ title: 'Compte mis à jour', color: 'success' })
  } catch (error) {
    const message = (error as { data?: { statusMessage?: string } }).data?.statusMessage
    toast.add({ title: 'Modification impossible', description: message, color: 'error' })
  } finally {
    enregistrement.value = false
  }
}
</script>
