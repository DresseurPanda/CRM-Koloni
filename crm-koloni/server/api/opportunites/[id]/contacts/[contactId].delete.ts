// Retrait d'un contact d'une opportunité, journalisé par le trigger trg_journal_opportunite_contact
import * as z from 'zod'

const params = z.object({
  id: z.string().regex(/^\d+$/),
  contactId: z.string().regex(/^\d+$/)
})

export default defineEventHandler(async (event) => {
  const { id, contactId } = await getValidatedRouterParams(event, params.parse)
  const session = await exigerActionOpportunite(event, id, 'gererContacts')

  try {
    return await enTransaction(event, session.user.id, async (tx) => {
      const [lien] = await tx`
        DELETE FROM opportunite_contact
        WHERE opportunite_id = ${id}
          AND contact_id = ${contactId}
        RETURNING contact_id
      `
      if (!lien) {
        throw createError({ statusCode: 404, statusMessage: 'Ce contact n\'est pas rattaché à cette opportunité' })
      }

      return { opportuniteId: id, contactId }
    })
  } catch (error) {
    throw erreurSql(error)
  }
})
