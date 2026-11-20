<!--
  MenuApplication — en-tête de l'application : titre, navigation, utilisateur connecté, thème et déconnexion
  Sur mobile, la navigation s'ouvre dans un panneau latéral à gauche.
  L'entrée « Comptes » n'apparaît que pour un administrateur.
  Aucune prop : l'utilisateur est lu via useAuth()
-->
<template>
  <UHeader
    title="CRM Koloni"
    mode="slideover"
    toggle-side="left"
    :menu="{ side: 'left' }"
    :toggle="{ color: 'primary', variant: 'subtle' }"
  >
    <UNavigationMenu
      :items="items"
      :ui="UI_LIENS"
      aria-label="Navigation principale"
    />
    <template #right>
      <InfoUtilisateur v-if="isAuthenticated" />
      <UColorModeButton />
      <UTooltip
        v-if="isAuthenticated"
        text="Se déconnecter"
      >
        <UButton
          icon="i-lucide-log-out"
          color="neutral"
          variant="ghost"
          aria-label="Se déconnecter"
          @click="seDeconnecter"
        />
      </UTooltip>
    </template>
    <!-- Panneau latéral affiché sur mobile -->
    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
        :ui="UI_LIENS"
        aria-label="Navigation mobile"
      />
    </template>
  </UHeader>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const { isAuthenticated, isAdmin, logout } = useAuth()

// Ferme la session puis renvoie à la page de connexion
async function seDeconnecter() {
  await logout()
  await navigateTo('/connexion/login', { replace: true })
}

const items = computed<NavigationMenuItem[]>(() => [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/' },
  { label: 'Opportunités', icon: 'i-lucide-briefcase', to: '/opportunites' },
  { label: 'Contacts', icon: 'i-lucide-users', to: '/contacts' },
  { label: 'Consultants', icon: 'i-lucide-user-search', to: '/profils-exterieurs' },
  ...(isAdmin.value ? [{ label: 'Comptes', icon: 'i-lucide-shield', to: '/comptes' }] : [])
])

// Liens et icônes en couleur primaire au survol (menu principal et menu mobile)
const UI_LIENS = { link: 'hover:text-primary', linkLeadingIcon: 'group-hover:text-primary' }
</script>
