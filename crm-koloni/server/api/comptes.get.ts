// Liste des comptes membres avec leurs compteurs d'activité, réservée aux administrateurs (EF-02)
// Filtres facultatifs en paramètres d'URL : actif (true / false), disponibilite, recherche (nom, prénom, mail)
import * as z from 'zod'
import type { Compte, Disponibilite, Role } from '#shared/types/utilisateur'

interface LigneCompte {
  id: string
  nom: string
  prenom: string
  mail: string
  telephone: string | null
  ville: string | null
  role: Role
  disponibilite: Disponibilite
  date_disponibilite: string | null
  actif: boolean
  date_creation: string
  nb_opportunites_apportees: number
  nb_opportunites_moteur: number
  nb_positionnements: number
  nb_missions_signees: number
}

const filtres = z.object({
  actif: z.enum(['true', 'false']).optional(),
  disponibilite: champsMembre.disponibilite.optional(),
  recherche: z.string().trim().max(100).optional()
})

export default defineEventHandler(async (event): Promise<Compte[]> => {
  await exigerAdmin(event)
  const requete = await getValidatedQuery(event, filtres.parse)
  const sql = useDb(event)

  const actif = requete.actif === undefined ? null : requete.actif === 'true'
  const disponibilite = requete.disponibilite ?? null
  // Les caractères \ % _ sont des jokers de ILIKE : on les neutralise pour chercher le texte tel quel
  const recherche = requete.recherche ? requete.recherche.replace(/[\\%_]/g, '\\$&') : null

  const lignes = await sql<LigneCompte[]>`
    SELECT
      m.id::text, m.nom, m.prenom, m.mail, m.telephone, m.ville,
      m.role, m.disponibilite,
      -- date_disponibilite : fin de mission (en mission) ou date de disponibilité (à l'écoute)
      to_char(m.date_disponibilite, 'YYYY-MM-DD') AS date_disponibilite,
      m.actif,
      to_char(m.date_creation, 'YYYY-MM-DD') AS date_creation,
      (SELECT count(*)::int FROM opportunite o WHERE o.apporteur_id = m.id)      AS nb_opportunites_apportees,
      (SELECT count(*)::int FROM opportunite o WHERE o.moteur_id = m.id)         AS nb_opportunites_moteur,
      (SELECT count(*)::int FROM positionnement p WHERE p.membre_id = m.id)      AS nb_positionnements,
      (SELECT count(*)::int FROM opportunite o WHERE o.preneur_membre_id = m.id) AS nb_missions_signees
    FROM membre_resume m
    WHERE (${actif}::boolean IS NULL OR m.actif = ${actif})
      AND (${disponibilite}::text IS NULL OR m.disponibilite = ${disponibilite})
      AND (${recherche}::text IS NULL
           OR (m.nom || ' ' || m.prenom || ' ' || m.mail) ILIKE '%' || ${recherche}::text || '%')
    ORDER BY m.actif DESC, m.nom, m.prenom
  `

  return lignes.map(l => ({
    id: l.id,
    nom: l.nom,
    prenom: l.prenom,
    mail: l.mail,
    telephone: nullEnUndefined(l.telephone),
    ville: nullEnUndefined(l.ville),
    role: l.role,
    disponibilite: l.disponibilite,
    dateDisponibilite: nullEnUndefined(l.date_disponibilite),
    actif: l.actif,
    dateCreation: l.date_creation,
    nbOpportunitesApportees: l.nb_opportunites_apportees,
    nbOpportunitesMoteur: l.nb_opportunites_moteur,
    nbPositionnements: l.nb_positionnements,
    nbMissionsSignees: l.nb_missions_signees
  }))
})
