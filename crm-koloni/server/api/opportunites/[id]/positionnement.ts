import * as z from 'zod'

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/)
})

export default defineEventHandler(async (event) => {
  const session = await exigerSession(event)
  const membreId = session.user?.id

  if (!membreId) {
    throw createError({ statusCode: 401, statusMessage: 'Utilisateur non identifié dans la session' })
  }

  const { id: opportuniteId } = await getValidatedRouterParams(event, paramsSchema.parse)
  const method = getMethod(event)
  const sql = useDb(event)

  if (method === 'POST') {
    await sql.begin(async (sql) => {
      await sql`SELECT set_config('app.current_membre_id', ${String(membreId)}, true)`
      await sql`
        INSERT INTO positionnement (opportunite_id, membre_id, etat, date_positionnement)
        VALUES (${opportuniteId}, ${membreId}, 'positionne', NOW())
        ON CONFLICT (membre_id, opportunite_id)
        DO UPDATE SET etat = 'positionne', date_positionnement = NOW()
      `
    })
    return { success: true }
  }

  if (method === 'DELETE') {
    await sql.begin(async (sql) => {
      await sql`SELECT set_config('app.current_membre_id', ${String(membreId)}, true)`
      await sql`
        UPDATE positionnement
        SET etat = 'retire'
        WHERE opportunite_id = ${opportuniteId} AND membre_id = ${membreId}
      `
    })
    return { success: true }
  }

  throw createError({ statusCode: 405, statusMessage: 'Méthode non autorisée' })
})