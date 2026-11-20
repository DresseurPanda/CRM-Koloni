// Listes de codes et libellés, partagées avec le serveur (un seul endroit les définit)
type ListesOpportunite = typeof import('../../shared/utils/opportunites')

// StatutOpportunite — libellé d'un des 7 statuts du cycle de vie (recueil de besoins §3.3)
type StatutOpportunite = ListesOpportunite['LIBELLES_STATUT'][keyof ListesOpportunite['LIBELLES_STATUT']]

// Temperature — libellé du niveau de maturité d'une opportunité (recueil de besoins §3.3)
type Temperature = ListesOpportunite['LIBELLES_TEMPERATURE'][keyof ListesOpportunite['LIBELLES_TEMPERATURE']]

// Opportunite — opportunité commerciale suivie dans le CRM
interface Opportunite {
  id: string
  titre: string // intitulé résumant le besoin
  statut: StatutOpportunite
  technologies?: string[] // technologies demandées
  ville?: string
  mode?: string // télétravail / hybride / présentiel
  clientFinal?: string // entreprise où se déroule la mission, si connue
  apporteur: string // membre qui amène l'opportunité (obligatoire)
  temperature?: Temperature
  dateSignal: string // date de détection de l'opportunité (AAAA-MM-JJ)
}

// OpportuniteDetail — fiche complète d'une opportunité (GET /api/opportunites/:id), libellés en français
interface OpportuniteDetail {
  id: string
  titre: string
  statut: StatutOpportunite
  source?: string
  typeMission?: string
  niveauRecherche?: string
  temperature?: Temperature
  clientFinal?: string
  clientFinalSecteur?: string // seulement si le client final n'est pas choisi
  clientFinalTaille?: string
  apporteur: string
  saisiPar?: string // membre qui a saisi la fiche, s'il diffère de l'apporteur
  moteur?: string
  preneur?: string // freelance retenu, renseigné à la signature
  actionsAutorisees: {
    qualifier: boolean
    sePositionner: boolean
    choisirProfils: boolean
    changerStatut: boolean
    cloturer: boolean
    ajouterNote: boolean
    gererContacts: boolean
  }
  tjmAnnonce?: number
  tjmClient?: number
  tjmPreneur?: number
  dureeAnnonceeMois?: number
  nombreJours?: number
  charge?: string
  ville?: string
  mode?: string
  timing?: string
  modeCandidature?: string
  modeCandidaturePrecision?: string
  niveauDiffusion: string
  lienAnnonceExterieure?: string
  dateSignal: string // AAAA-MM-JJ, comme toutes les dates de la fiche
  dateCloture?: string
  dateRelance?: string
  raisonPerte?: string
  qualifieePar?: string
  dateQualification?: string
  dateOuvertureExterieur?: string // absente en interne strict ou avant la qualification
  codes: Record<string, string | undefined> // codes bruts de la base, pour préremplir les formulaires
  technologies: { nom: string, principale: boolean }[]
  contacts: { id: string, nom: string, prenom: string, role?: string, entreprise?: string, mail?: string, telephone?: string }[]
  positionnements: PositionnementOpportunite[]
  notes: { id: string, auteur: string, date: string, contenu: string }[] // date AAAA-MM-JJTHH:MM
  fil: { date: string, auteur: string, titre: string, detail?: string }[] // du plus récent au plus ancien
}

// PositionnementOpportunite — membre positionné sur une opportunité, avec l'état de son positionnement
interface PositionnementOpportunite {
  membreId: string
  nom: string
  prenom: string
  mail: string
  etat: string // libellé (« Positionné », « Retenu »…)
  etatCode: string // code en base (positionne, retenu…)
  date: string
  commentaire?: string
}

// NuxtUiColor — couleurs acceptées par les composants Nuxt UI (UBadge, UButton…)
type NuxtUiColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  | 'violet' | 'pink' | 'orange' | 'teal' | 'cyan' | 'rose' | 'indigo' | 'lime' | 'fuchsia' | 'purple'

// BadgeItem — pastille affichée dans TableauOpportunites
interface BadgeItem {
  label: string // texte affiché
  color: NuxtUiColor // couleur Nuxt UI
  icon?: string // icône affichée avant le label (nom Iconify)
  trailingIcon?: string // icône affichée après le label (nom Iconify)
  tooltip?: string // infobulle au survol sur desktop
  to?: string // si présent : pastille cliquable (NuxtLink)
}

// Contact — personne rattachée à une entreprise cliente (cahier des charges §3.3)
interface Contact {
  id: string
  nom: string
  prenom: string
  role?: string // fonction chez le client (colonne « Poste »)
  entrepriseId?: string // facultative : le contact peut être saisi avant que son entreprise soit connue
  entreprise?: string // nom de l'entreprise
  mail?: string
  telephone?: string
  lienLinkedin?: string
}

// EntrepriseCliente — société cliente proposée dans la liste déroulante d'un contact
interface EntrepriseCliente {
  id: string
  nom: string
}

// ProfilExterieurListe — ligne de la liste des profils extérieurs (GET /api/profils-exterieurs)
interface ProfilExterieurListe {
  id: string
  nom: string
  prenom: string
  technologies: string[]
  ville?: string
  disponibilite?: string // texte libre : « Immédiate », « À partir du … »
  dateSollicitation?: string // AAAA-MM-JJ de la dernière sollicitation ; absente si jamais sollicité
}

// PersonneListee — personne affichée en puce dans ListePersonnes
interface PersonneListee {
  id: string
  mail: string
  nom: string
  prenom: string
  categorie?: string // label de la CategoriePersonne de la puce (ex. état d'un positionnement)
}

// CategoriePersonne — groupe de puces dans ListePersonnes, avec sa couleur
interface CategoriePersonne {
  label: string // texte de la case à cocher et du titre du groupe
  color?: NuxtUiColor // couleur des puces du groupe ; défaut : la prop color de ListePersonnes
}
