/**
 * Libellés d'affichage des valeurs stockées en base (codes sans accent) et mise en forme des lignes
 *
 * Les listes des opportunités (statuts, modes, niveaux…) viennent de shared/utils/opportunites.ts,
 * partagé avec l'application ; seuls les types d'action du journal, affichés par le serveur, sont ici.
 */

import {
  LIBELLES_ETAT_POSITIONNEMENT,
  LIBELLES_MODE,
  LIBELLES_MODE_CANDIDATURE,
  LIBELLES_NIVEAU,
  LIBELLES_NIVEAU_DIFFUSION,
  LIBELLES_SOURCE,
  LIBELLES_STATUT,
  LIBELLES_TEMPERATURE,
  LIBELLES_TIMING
} from '#shared/utils/opportunites'

const TYPES_ACTION: Record<string, string> = {
  positionnement: 'Positionnement',
  presentation_profil: 'Profil présenté',
  note: 'Note',
  profil_exterieur_contacte: 'Profil extérieur sollicité',
  profil_exterieur_modifie: 'Profil extérieur modifié',
  contact_cree_modifie: 'Contact',
  entreprise_cree_modifiee: 'Entreprise cliente'
}

// Libellé d'un code d'une liste ; undefined si la colonne est vide
const libelle = (libelles: Record<string, string>) => (code: string | null) =>
  (code ? libelles[code] : undefined)

// Libellé d'un code d'une colonne obligatoire (toujours renseignée)
const libelleObligatoire = (libelles: Record<string, string>) => (code: string) => libelles[code]!

export const libelleStatut = libelleObligatoire(LIBELLES_STATUT)
export const libelleTemperature = libelle(LIBELLES_TEMPERATURE)
export const libelleMode = libelle(LIBELLES_MODE)
export const libelleSource = libelle(LIBELLES_SOURCE)
export const libelleNiveau = libelle(LIBELLES_NIVEAU)
export const libelleTiming = libelle(LIBELLES_TIMING)
export const libelleModeCandidature = libelle(LIBELLES_MODE_CANDIDATURE)
export const libelleNiveauDiffusion = libelleObligatoire(LIBELLES_NIVEAU_DIFFUSION)
export const libelleEtatPositionnement = libelleObligatoire(LIBELLES_ETAT_POSITIONNEMENT)
export const libelleTypeAction = (code: string) => TYPES_ACTION[code] ?? code

// Les colonnes vides arrivent en null ; les types du front attendent des champs absents (undefined)
export const nullEnUndefined = (valeur: string | null) => valeur ?? undefined
