<template>
  <div class="flex min-h-screen items-center justify-center bg-elevated/30 p-4">
    <UAuthForm
      :schema="schema"
      :fields="fields"
      :loading="loading"
      title="Connexion"
      description="Accédez à votre espace Koloni CRM"
      icon="i-lucide-log-in"
      :submit="{ label: 'Se connecter' }"
      class="w-full max-w-sm"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: false })

const schema = z.object({
  mail: z.email('Adresse mail invalide'),
  password: z.string().min(1, 'Le mot de passe est requis')
})

const fields = [
  {
    name: 'mail',
    type: 'text' as const,
    label: 'Adresse mail',
    placeholder: 'vous@exemple.fr',
    required: true
  },
  {
    name: 'password',
    type: 'password' as const,
    label: 'Mot de passe',
    placeholder: 'Votre mot de passe',
    required: true
  }
]

type Schema = z.output<typeof schema>

const loading = ref(false)
const toast = useToast()
const { refresh } = useAuth()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: event.data })
    await refresh()
    await navigateTo('/')
  } catch (error) {
    const message = (error as { data?: { statusMessage?: string } }).data?.statusMessage
    toast.add({ title: 'Connexion impossible', description: message, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
