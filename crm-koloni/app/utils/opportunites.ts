/**
 * Couleurs partagées par les écrans des opportunités (liste, fiche de détail)
 *
 * Les couleurs sont données par code ; les libellés viennent de shared/utils/opportunites.ts
 * (l'API renvoie des libellés, d'où l'indexation par libellé des tables ci-dessous).
 */

// Pour chaque statut : couleur du badge et couleur de la barre à gauche d'une ligne du tableau
const COULEURS_PAR_STATUT: Record<keyof typeof LIBELLES_STATUT, { couleur: NuxtUiColor, barre: string }> = {
  signal: { couleur: 'neutral', barre: 'bg-neutral-400' },
  matching: { couleur: 'info', barre: 'bg-info-500' },
  propose: { couleur: 'warning', barre: 'bg-warning-500' },
  en_discussion: { couleur: 'warning', barre: 'bg-warning-500' },
  signe: { couleur: 'success', barre: 'bg-success-500' },
  perdu: { couleur: 'error', barre: 'bg-error-500' },
  en_pause: { couleur: 'neutral', barre: 'bg-neutral-400' }
}

export const STATUTS_OPPORTUNITE = Object.fromEntries(
  Object.entries(COULEURS_PAR_STATUT).map(([code, couleurs]) => [LIBELLES_STATUT[code as keyof typeof LIBELLES_STATUT], couleurs])
) as Record<StatutOpportunite, { couleur: NuxtUiColor, barre: string }>

// Couleur du badge de température
const COULEURS_PAR_TEMPERATURE: Record<keyof typeof LIBELLES_TEMPERATURE, NuxtUiColor> = {
  chaud: 'error',
  tiede: 'info'
}

export const COULEURS_TEMPERATURE = Object.fromEntries(
  Object.entries(COULEURS_PAR_TEMPERATURE).map(([code, couleur]) => [LIBELLES_TEMPERATURE[code as keyof typeof LIBELLES_TEMPERATURE], couleur])
) as Record<Temperature, NuxtUiColor>

// Couleur de chaque état d'un positionnement (recueil de besoins §3.3)
const COULEURS_PAR_ETAT: Record<keyof typeof LIBELLES_ETAT_POSITIONNEMENT, NuxtUiColor> = {
  positionne: 'primary',
  presente: 'info',
  retenu: 'success',
  ecarte: 'error',
  retire: 'neutral'
}

// États d'un positionnement, dans l'ordre du cycle, au format des catégories de ListePersonnes
export const ETATS_POSITIONNEMENT: CategoriePersonne[] = Object.entries(COULEURS_PAR_ETAT).map(([code, color]) => ({
  label: LIBELLES_ETAT_POSITIONNEMENT[code as keyof typeof LIBELLES_ETAT_POSITIONNEMENT],
  color
}))
