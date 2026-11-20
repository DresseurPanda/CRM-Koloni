// Fiche complète d'un membre, pour le formulaire de modification (réservée aux administrateurs)
import * as z from 'zod'
import type { CompteDetail, Disponibilite, Role } from '#shared/types/utilisateur'

interface LigneCompteDetail {
  id: string
  nom: string
  prenom: string
  mail: string
  telephone: string | null
  lien_linkedin: string | null
  notes: string | null
  role: Role
  ville: string | null
  disponibilite: Disponibilite
  date_disponibilite: string | null
  actif: boolean
}

const params = z.object({
  id: z.string().regex(/^\d+$/)
})

export default defineEventHandler(async (event): Promise<CompteDetail> => {
  await exigerAdmin(event)
  const { id } = await getValidatedRouterParams(event, params.parse)
  const sql = useDb(event)

  const [m] = await sql<LigneCompteDetail[]>`
    SELECT
      id::text, nom, prenom, mail, telephone, lien_linkedin, notes, role, ville, disponibilite,
      to_char(date_disponibilite, 'YYYY-MM-DD') AS date_disponibilite,
      actif
    FROM membre_resume
    WHERE id = ${id}
  `

  if (!m) {
    throw createError({ statusCode: 404, statusMessage: 'Compte introuvable' })
  }

  return {
    id: m.id,
    nom: m.nom,
    prenom: m.prenom,
    mail: m.mail,
    telephone: nullEnUndefined(m.telephone),
    lienLinkedin: nullEnUndefined(m.lien_linkedin),
    notes: nullEnUndefined(m.notes),
    role: m.role,
    ville: nullEnUndefined(m.ville),
    disponibilite: m.disponibilite,
    dateDisponibilite: nullEnUndefined(m.date_disponibilite),
    actif: m.actif
  }
})
