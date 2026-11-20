// Modification d'un compte (informations, rôle, état actif / désactivé, disponibilité), réservée aux administrateurs.
// Seuls les champs envoyés sont modifiés ; une valeur vide efface un champ facultatif.
// Un compte désactivé n'est jamais supprimé : ses traces sont conservées.
import * as z from 'zod'
import { DISPONIBILITES_DATEES, Role } from '#shared/types/utilisateur'

const params = z.object({
  id: z.string().regex(/^\d+$/)
})

const schema = z.object({
  nom: champsMembre.nom.optional(),
  prenom: champsMembre.prenom.optional(),
  mail: champsMembre.mail.optional(),
  telephone: champsMembre.telephone.optional(),
  lien_linkedin: champsMembre.lien_linkedin.optional(),
  notes: champsMembre.notes.optional(),
  role: champsMembre.role.optional(),
  ville: champsMembre.ville.optional(),
  disponibilite: champsMembre.disponibilite.optional(),
  date_disponibilite: champsMembre.date_disponibilite.optional(),
  actif: z.boolean().optional()
}).refine(corps => Object.values(corps).some(valeur => valeur !== undefined), {
  message: 'Rien à modifier'
})

export default defineEventHandler(async (event) => {
  await exigerAdmin(event)
  const { id } = await getValidatedRouterParams(event, params.parse)
  const corps = await lireCorps(event, schema)
  const sql = useDb(event)

  const champs: Record<string, unknown> = Object.fromEntries(
    Object.entries(corps).filter(([, valeur]) => valeur !== undefined)
  )
  // Un membre qui passe dans un état sans date (en recherche, inconnue) perd sa date de disponibilité
  if (corps.disponibilite && !DISPONIBILITES_DATEES.includes(corps.disponibilite)) champs.date_disponibilite = null

  // Retirer le rôle administrateur ou désactiver un compte n'est permis que s'il reste un autre administrateur actif,
  // sinon l'application se retrouverait sans personne pour gérer les comptes
  const retireAdmin = corps.role === Role.membre || corps.actif === false

  try {
    const [modifie] = await sql<{ id: string }[]>`
      UPDATE membre
      SET ${sql(champs, ...Object.keys(champs))}
      WHERE id = ${id}
        AND (NOT ${retireAdmin}::boolean
             OR role <> 'administrateur'
             OR NOT actif
             OR EXISTS (SELECT 1 FROM membre a
                        WHERE a.role = 'administrateur' AND a.actif AND a.id <> ${id}))
      RETURNING id::text
    `

    if (!modifie) {
      const [existe] = await sql`SELECT 1 FROM membre WHERE id = ${id}`
      throw existe
        ? createError({ statusCode: 409, statusMessage: 'Ce compte est le dernier administrateur actif : il doit rester au moins un administrateur actif' })
        : createError({ statusCode: 404, statusMessage: 'Compte introuvable' })
    }
    return modifie
  } catch (error) {
    throw erreurSql(error)
  }
})
