import { Role } from '#shared/types/utilisateur'

export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, role } = useAuth()

  // Page de connexion : un utilisateur déjà connecté est renvoyé à l'accueil
  if (to.path === '/connexion/login') {
    return isAuthenticated.value ? navigateTo('/', { replace: true }) : true
  }

  // Toute autre page exige d'être connecté
  if (!isAuthenticated.value) return navigateTo('/connexion/login', { replace: true })

  // Gestion et création des comptes réservées aux administrateurs
  if (to.path.startsWith('/comptes') && role.value !== Role.admin) {
    return navigateTo('/', { replace: true })
  }
})
