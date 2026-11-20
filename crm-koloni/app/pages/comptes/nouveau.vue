<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="mb-4">
      <UButton
        label="Retour aux comptes"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/comptes"
      />
    </div>

    <header class="mb-8">
      <h1 class="text-2xl font-bold text-highlighted">
        Ajouter un membre
      </h1>
      <p class="mt-1 text-sm text-muted">
        Créez un compte pour un membre du collectif.
      </p>
    </header>

    <UForm
      :state="form"
      class="space-y-5"
      @submit="creer"
    >
      <CarteTitree
        icon="i-lucide-user-plus"
        title="Informations du membre"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            label="Adresse email"
            name="mail"
            required
          >
            <UInput
              v-model="form.mail"
              type="email"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Mot de passe temporaire"
            name="password"
            required
          >
            <UInput
              v-model="form.password"
              type="password"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Rôle"
            name="role"
          >
            <USelect
              v-model="form.role"
              :items="roles"
              class="w-full"
            />
          </UFormField>
        </div>
      </CarteTitree>

      <footer class="flex items-center justify-end gap-3 pt-4">
        <UButton
          to="/comptes"
          color="neutral"
          variant="ghost"
        >
          Annuler
        </UButton>
        <UButton
          type="submit"
          :loading="creation"
          icon="i-lucide-check"
        >
          Créer le membre
        </UButton>
      </footer>
    </UForm>
  </UContainer>
</template>

<script setup lang="ts">
import { Role } from '#shared/types/utilisateur'

const router = useRouter()
const toast = useToast()
const roles = [{ label: 'Membre', value: Role.membre }, { label: 'Administrateur', value: Role.admin }]
const form = reactive({ prenom: '', nom: '', mail: '', password: '', role: Role.membre })
const creation = ref(false)

async function creer() {
  creation.value = true
  try {
    await $fetch('/api/comptes', { method: 'POST', body: form })
    toast.add({ title: 'Membre créé avec succès', color: 'success' })
    await router.push('/comptes')
  } catch (error) {
    toast.add({ title: 'Création impossible', description: (error as { data?: { statusMessage?: string } }).data?.statusMessage, color: 'error' })
  } finally {
    creation.value = false
  }
}
</script>
