// Indique si une adresse mail est déjà celle d'un compte, quelle que soit la casse.
// Paramètre facultatif « sauf » : identifiant du membre en cours de modification, dont le mail ne compte pas.
import * as z from 'zod'

const filtres = z.object({
  mail: z.string().trim().min(1).max(255),
  sauf: z.string().regex(/^\d+$/).optional()
})

export default defineEventHandler(async (event) => {
  await exigerAdmin(event)
  const { mail, sauf } = await getValidatedQuery(event, filtres.parse)
  const sql = useDb(event)

  const [ligne] = await sql<{ utilise: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM membre
      WHERE lower(mail) = lower(${mail})
        AND (${sauf ?? null}::bigint IS NULL OR id <> ${sauf ?? null}::bigint)
    ) AS utilise
  `

  return { utilise: ligne!.utilise }
})
