// Types des listes de référence (entreprises clientes, technologies), partagés par l'application et le serveur

// ObjetCree — entreprise ou technologie créée à la volée par un formulaire, à compléter ensuite sur sa fiche
export interface ObjetCree {
  id: string
  nom: string
}

// EntrepriseDetail — fiche d'une entreprise cliente (GET /api/entreprises/:id)
export interface EntrepriseDetail {
  id: string
  nom: string
  secteur?: string
  taille?: string // ordre de grandeur de l'effectif
  ville?: string // localisation principale
}

// TechnologieDetail — fiche d'une technologie (GET /api/technologies/:id)
export interface TechnologieDetail {
  id: string
  nom: string
  familleId?: string // famille (ETL, BI…) qui sert au filtre par domaine ; facultative
}

// FamilleTechnologie — une famille de technologies (GET /api/familles-technologie)
export interface FamilleTechnologie {
  id: string
  nom: string
}
