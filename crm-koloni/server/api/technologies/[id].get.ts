// Fiche d'une technologie, pour la rattacher à sa famille (ouverte à tout membre connecté)
import * as z from 'zod'
import type { TechnologieDetail } from '#shared/types/referentiels'

const params = z.object({
  id: z.string().regex(/^\d+$/)
})

export default defineEventHandler(async (event): Promise<TechnologieDetail> => {
  await exigerSession(event)
  const { id } = await getValidatedRouterParams(event, params.parse)
  const sql = useDb(event)

  const [technologie] = await sql<{ id: string, nom: string, famille_id: string | null }[]>`
    SELECT id::text, nom, famille_id::text
    FROM technologie
    WHERE id = ${id}
  `
  if (!technologie) {
    throw createError({ statusCode: 404, statusMessage: 'Technologie introuvable' })
  }

  return {
    id: technologie.id,
    nom: technologie.nom,
    familleId: nullEnUndefined(technologie.famille_id)
  }
})
