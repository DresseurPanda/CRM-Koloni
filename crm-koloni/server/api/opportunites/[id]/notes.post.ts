// Ajout d'une note sur une opportunité par le membre connecté, journalisé par le trigger trg_journal_note
import * as z from 'zod'

const params = z.object({
  id: z.string().regex(/^\d+$/)
})

const schema = z.object({
  contenu: z.string().trim().min(1, 'La note ne peut pas être vide.').max(5000, 'La note ne peut pas dépasser 5000 caractères.')
})

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, params.parse)
  const session = await exigerActionOpportunite(event, id, 'ajouterNote')
  const { contenu } = await lireCorps(event, schema)

  try {
    return await enTransaction(event, session.user.id, async (tx) => {
      const [note] = await tx<{ id: string }[]>`
        INSERT INTO note (opportunite_id, auteur_id, contenu)
        VALUES (${id}, ${session.user.id}, ${contenu})
        RETURNING id::text
      `
      setResponseStatus(event, 201)
      return { id: note!.id }
    })
  } catch (error) {
    throw erreurSql(error)
  }
})
