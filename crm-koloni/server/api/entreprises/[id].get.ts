// Fiche d'une entreprise cliente, pour la compléter ou la corriger (ouverte à tout membre connecté)
import * as z from 'zod'
import type { EntrepriseDetail } from '#shared/types/referentiels'

const params = z.object({
  id: z.string().regex(/^\d+$/)
})

interface LigneEntreprise {
  id: string
  nom: string
  secteur: string | null
  taille: string | null
  ville: string | null
}

export default defineEventHandler(async (event): Promise<EntrepriseDetail> => {
  await exigerSession(event)
  const { id } = await getValidatedRouterParams(event, params.parse)
  const sql = useDb(event)

  const [entreprise] = await sql<LigneEntreprise[]>`
    SELECT id::text, nom, secteur, taille, ville
    FROM entreprise_cliente
    WHERE id = ${id}
  `
  if (!entreprise) {
    throw createError({ statusCode: 404, statusMessage: 'Entreprise introuvable' })
  }

  return {
    id: entreprise.id,
    nom: entreprise.nom,
    secteur: nullEnUndefined(entreprise.secteur),
    taille: nullEnUndefined(entreprise.taille),
    ville: nullEnUndefined(entreprise.ville)
  }
})
