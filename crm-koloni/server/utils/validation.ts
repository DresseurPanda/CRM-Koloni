/**
 * Lecture du corps d'une requête, validé par un schéma zod
 *
 * Remplace readValidatedBody de h3, qui renvoie toujours « Validation Error » : ici, le message
 * de la première règle non respectée devient le statusMessage, que les pages affichent tel quel.
 * À appeler dans une route : `const corps = await lireCorps(event, schema)`.
 */

import * as z from 'zod'
import type { H3Event } from 'h3'

// Messages par défaut de zod en français (« Trop petit : … »), pour les règles sans message propre
z.config(z.locales.fr())

export async function lireCorps<Schema extends z.ZodType>(event: H3Event, schema: Schema): Promise<z.output<Schema>> {
  const resultat = schema.safeParse(await readBody(event))
  if (resultat.success) return resultat.data

  const [probleme] = resultat.error.issues
  // Un message écrit dans le schéma (refine) se suffit ; un message par défaut est précédé du champ concerné
  const message = !probleme
    ? 'Données invalides.'
    : probleme.code === 'custom' || probleme.path.length === 0
      ? probleme.message
      : `${probleme.path.join('.')} : ${probleme.message}`
  throw createError({ statusCode: 400, statusMessage: message })
}
