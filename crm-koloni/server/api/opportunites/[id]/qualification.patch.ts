// Qualification explicite d'une opportunité : passage de Signal à Matching, réservé à l'apporteur et aux administrateurs
import * as z from 'zod'

const params = z.object({
  id: z.string().regex(/^\d+$/)
})

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, params.parse)
  const session = await exigerActionOpportunite(event, id, 'qualifier')

  try {
    return await enTransaction(event, session.user.id, async (tx) => {
      // Les conditions du WHERE empêchent une double qualification si deux membres valident en même temps
      const [qualifiee] = await tx<{ id: string, statut: string }[]>`
        UPDATE opportunite
        SET statut = 'matching',
            qualifiee_par_id = ${session.user.id},
            date_qualification = now()
        WHERE id = ${id}
          AND statut = 'signal'
          AND qualifiee_par_id IS NULL
        RETURNING id::text, statut
      `
      if (!qualifiee) {
        throw createError({ statusCode: 409, statusMessage: 'Cette opportunité a déjà été qualifiée ou n\'est plus au statut Signal' })
      }
      return { id: qualifiee.id, statut: libelleStatut(qualifiee.statut) }
    })
  } catch (error) {
    throw erreurSql(error)
  }
})
