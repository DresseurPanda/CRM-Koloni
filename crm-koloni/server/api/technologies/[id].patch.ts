// Modification d'une technologie : son nom ou sa famille (ouverte à tout membre connecté)
// Seuls les champs envoyés changent ; familleId à null retire la technologie de sa famille.
import * as z from 'zod'

const params = z.object({
  id: z.string().regex(/^\d+$/)
})

const schema = z.object({
  nom: z.string().trim().min(1).max(100).optional(),
  familleId: z.string().regex(/^\d+$/).nullish()
}).refine(corps => corps.nom !== undefined || corps.familleId !== undefined, {
  message: 'Rien à modifier'
})

export default defineEventHandler(async (event) => {
  await exigerSession(event)
  const { id } = await getValidatedRouterParams(event, params.parse)
  const corps = await lireCorps(event, schema)
  const sql = useDb(event)

  // Seuls les champs envoyés sont mis à jour (famille_id : nom de la colonne en base)
  const champs: Record<string, unknown> = {}
  if (corps.nom !== undefined) champs.nom = corps.nom
  if (corps.familleId !== undefined) champs.famille_id = corps.familleId

  try {
    const [modifiee] = await sql<{ id: string }[]>`
      UPDATE technologie
      SET ${sql(champs, ...Object.keys(champs))}
      WHERE id = ${id}
      RETURNING id::text
    `
    if (!modifiee) {
      throw createError({ statusCode: 404, statusMessage: 'Technologie introuvable' })
    }
    return modifiee
  } catch (error) {
    throw erreurSql(error)
  }
})
