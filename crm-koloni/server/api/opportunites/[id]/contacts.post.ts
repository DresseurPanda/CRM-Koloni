// Rattachement d'un contact existant à une opportunité, journalisé par le trigger trg_journal_opportunite_contact
import * as z from 'zod'

const params = z.object({
  id: z.string().regex(/^\d+$/)
})

const schema = z.object({
  contactId: z.string().regex(/^\d+$/)
})

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, params.parse)
  const session = await exigerActionOpportunite(event, id, 'gererContacts')
  const { contactId } = await lireCorps(event, schema)

  try {
    return await enTransaction(event, session.user.id, async (tx) => {
      await tx`
        INSERT INTO opportunite_contact (opportunite_id, contact_id)
        VALUES (${id}, ${contactId})
      `

      return { opportuniteId: id, contactId }
    })
  } catch (error) {
    throw erreurSql(error)
  }
})
