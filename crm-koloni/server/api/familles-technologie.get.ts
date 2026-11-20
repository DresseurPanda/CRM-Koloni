// Liste des familles de technologies par ordre alphabétique (choix de la famille d'une technologie)
import type { FamilleTechnologie } from '#shared/types/referentiels'

export default defineEventHandler(async (event): Promise<FamilleTechnologie[]> => {
  await exigerSession(event)
  const sql = useDb(event)

  return await sql<FamilleTechnologie[]>`
    SELECT id::text, nom
    FROM famille_technologie
    ORDER BY nom
  `
})
