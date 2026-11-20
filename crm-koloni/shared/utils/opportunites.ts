/**
 * Codes des opportunités tels qu'ils sont stockés en base (sans accent) et leurs libellés français
 *
 * Partagé par l'application et le serveur (Nuxt importe automatiquement shared/utils des deux
 * côtés) : les listes déroulantes, la validation zod des routes et la traduction des réponses
 * en sont toutes déduites. Une valeur s'ajoute ou se renomme ici, et nulle part ailleurs.
 */

export const LIBELLES_STATUT = {
  signal: 'Signal',
  matching: 'Matching',
  propose: 'Proposé',
  en_discussion: 'En discussion',
  signe: 'Signé',
  perdu: 'Perdu',
  en_pause: 'En pause'
} as const

export const LIBELLES_TEMPERATURE = {
  chaud: 'Chaud',
  tiede: 'Tiède'
} as const

export const LIBELLES_MODE = {
  teletravail: 'Télétravail',
  hybride: 'Hybride',
  presentiel: 'Présentiel'
} as const

export const LIBELLES_SOURCE = {
  client: 'Client',
  commercial: 'Commercial (ESN)',
  contact: 'Contact'
} as const

export const LIBELLES_NIVEAU = {
  operationnel: 'Opérationnel',
  senior: 'Senior',
  expert: 'Expert'
} as const

export const LIBELLES_TIMING = {
  urgent: 'Urgent',
  moins_1_mois: 'Dans moins d\'un mois',
  plus_1_mois: 'Dans plus d\'un mois'
} as const

export const LIBELLES_MODE_CANDIDATURE = {
  via_apporteur: 'Via l\'apporteur',
  contact_direct_recruteur: 'Contact direct recruteur',
  via_moteur: 'Via le moteur'
} as const

export const LIBELLES_NIVEAU_DIFFUSION = {
  libre: 'Libre',
  reseau_perso: 'Réseau personnel',
  interne_strict: 'Interne strict'
} as const

export const LIBELLES_ETAT_POSITIONNEMENT = {
  positionne: 'Positionné',
  presente: 'Présenté au client',
  retenu: 'Retenu',
  ecarte: 'Écarté',
  retire: 'Retiré'
} as const

// Codes d'une liste, au format attendu par z.enum (au moins un élément)
export const codesDe = <T extends Record<string, string>>(libelles: T) =>
  Object.keys(libelles) as [keyof T & string, ...(keyof T & string)[]]

// Options d'une liste déroulante (USelect, URadioGroup) : le libellé affiché, le code envoyé
export const optionsDe = <T extends Record<string, string>>(libelles: T) =>
  Object.entries(libelles).map(([value, label]) => ({ label, value: value as keyof T & string }))

// Date AAAA-MM-JJ (ou AAAA-MM-JJTHH:MM) → JJ/MM/AAAA (à HH:MM) ; chaîne vide si pas de date
export function formaterDate(iso?: string | null): string {
  if (!iso) return ''
  const [date, heure] = iso.split('T')
  const jour = date!.split('-').reverse().join('/')
  return heure ? `${jour} à ${heure}` : jour
}
