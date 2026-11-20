// Modification d'une entreprise cliente (ouverte à tout membre connecté, comme pour les contacts)
// Seuls les champs envoyés changent ; envoyer null (ou un texte vide) efface un champ facultatif.
// Le trigger du journal enregistre la modification, avec le membre connecté comme auteur.
import * as z from 'zod'

const params = z.object({
  id: z.string().regex(/^\d+$/)
})

const texteFacultatif = (longueurMax: number) =>
  z.string().trim().max(longueurMax).transform(texte => texte === '' ? null : texte).nullish()

const schema = z.object({
  nom: z.string().trim().min(1).max(255).optional(),
  secteur: texteFacultatif(150),
  taille: texteFacultatif(50),
  ville: texteFacultatif(100)
}).refine(corps => Object.values(corps).some(valeur => valeur !== undefined), {
  message: 'Rien à modifier'
})

export default defineEventHandler(async (event) => {
  const session = await exigerSession(event)
  const { id } = await getValidatedRouterParams(event, params.parse)
  const corps = await lireCorps(event, schema)

  // Seuls les champs envoyés sont mis à jour
  const champs = Object.fromEntries(Object.entries(corps).filter(([, valeur]) => valeur !== undefined))

  try {
    return await enTransaction(event, session.user.id, async (tx) => {
      const [modifiee] = await tx<{ id: string }[]>`
        UPDATE entreprise_cliente
        SET ${tx(champs, ...Object.keys(champs))}
        WHERE id = ${id}
        RETURNING id::text
      `
      if (!modifiee) {
        throw createError({ statusCode: 404, statusMessage: 'Entreprise introuvable' })
      }
      return modifiee
    })
  } catch (error) {
    throw erreurSql(error)
  }
})
