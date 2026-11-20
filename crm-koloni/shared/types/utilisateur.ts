// Role — les deux profils d'utilisateurs du CRM (recueil de besoins §1.3)
// Les valeurs sont celles stockées dans membre.role.
export enum Role {
  admin = 'administrateur',
  membre = 'membre'
}

// Utilisateur — compte connecté au CRM
export interface Utilisateur {
  id: string
  nom: string
  prenom: string
  mail: string
  role: Role
}

// Libellés des quatre états de disponibilité d'un membre (codes de membre.disponibilite)
export const LIBELLES_DISPONIBILITE = {
  inconnu: 'Inconnue',
  en_recherche: 'En recherche',
  a_l_ecoute: 'À l\'écoute',
  en_mission: 'En mission'
} as const

// Disponibilite — situation d'un membre, visible de tout le collectif ; inconnu pour un compte neuf
export type Disponibilite = keyof typeof LIBELLES_DISPONIBILITE

// États qui portent une date (date_disponibilite) : fin de mission, ou date de disponibilité si à l'écoute
export const DISPONIBILITES_DATEES: Disponibilite[] = ['en_mission', 'a_l_ecoute']

// Compte — ligne de la liste d'administration des membres, avec ses compteurs d'activité
export interface Compte {
  id: string
  nom: string
  prenom: string
  mail: string
  telephone?: string
  ville?: string
  role: Role
  disponibilite: Disponibilite
  dateDisponibilite?: string // AAAA-MM-JJ, uniquement pour un état de DISPONIBILITES_DATEES
  actif: boolean
  dateCreation: string
  nbOpportunitesApportees: number
  nbOpportunitesMoteur: number
  nbPositionnements: number
  nbMissionsSignees: number
}

// CompteDetail — fiche complète d'un membre, pour le formulaire de modification
export interface CompteDetail {
  id: string
  nom: string
  prenom: string
  mail: string
  telephone?: string
  lienLinkedin?: string
  notes?: string
  role: Role
  ville?: string
  disponibilite: Disponibilite
  dateDisponibilite?: string
  actif: boolean
}

// CompteursComptes — totaux affichés en tête de la page d'administration
export interface CompteursComptes {
  actifs: number
  desactives: number
  administrateurs: number
  // Membres actifs dans chaque état de disponibilité
  inconnu: number
  enRecherche: number
  aLEcoute: number
  enMission: number
}
