// Changement de statut d'une opportunité : transitions libres, historisées par le trigger trg_opportunite_historique_statut
import * as z from 'zod'

// Seuls statuts qu'une opportunité non qualifiée peut prendre
const STATUTS_SANS_QUALIFICATION = ['signal', 'perdu', 'en_pause']

const params = z.object({
  id: z.string().regex(/^\d+$/)
})

const schema = z.object({
  statut: z.enum(codesDe(LIBELLES_STATUT)),
  raisonPerte: z.string().trim().min(1).optional(),
  dateRelance: z.iso.date().optional()
}).superRefine((donnees, contexte) => {
  if (donnees.statut === 'perdu' && !donnees.raisonPerte) {
    contexte.addIssue({
      code: 'custom',
      path: ['raisonPerte'],
      message: 'La raison de la perte est obligatoire'
    })
  }
  if (donnees.statut === 'en_pause' && !donnees.dateRelance) {
    contexte.addIssue({
      code: 'custom',
      path: ['dateRelance'],
      message: 'La date de relance est obligatoire pour une opportunité en pause'
    })
  }
})

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, params.parse)
  const session = await exigerActionOpportunite(event, id, 'changerStatut')
  const donnees = await lireCorps(event, schema)

  try {
    return await enTransaction(event, session.user.id, async (tx) => {
      // FOR UPDATE : deux changements simultanés ne peuvent pas partir du même statut
      const [opportunite] = await tx<{ statut: string, qualifiee: boolean }[]>`
        SELECT statut, (qualifiee_par_id IS NOT NULL) AS qualifiee
        FROM opportunite
        WHERE id = ${id}
        FOR UPDATE
      `
      if (!opportunite) {
        throw createError({ statusCode: 404, statusMessage: 'Opportunité introuvable' })
      }

      if (opportunite.statut === donnees.statut) {
        throw createError({ statusCode: 409, statusMessage: 'Cette opportunité possède déjà ce statut' })
      }

      if (!opportunite.qualifiee && !STATUTS_SANS_QUALIFICATION.includes(donnees.statut)) {
        throw createError({ statusCode: 409, statusMessage: 'Une opportunité non qualifiée ne peut être qu\'en Signal, Perdu ou En pause' })
      }

      await tx`
        UPDATE opportunite
        SET statut = ${donnees.statut},
            raison_perte = ${donnees.statut === 'perdu' ? donnees.raisonPerte ?? null : null},
            date_relance = ${donnees.statut === 'en_pause' ? donnees.dateRelance ?? null : null}::date,
            date_cloture = CASE
              WHEN ${donnees.statut}::text IN ('signe', 'perdu') THEN CURRENT_DATE
              ELSE NULL
            END
        WHERE id = ${id}
      `

      return { id, statut: libelleStatut(donnees.statut) }
    })
  } catch (error) {
    throw erreurSql(error)
  }
})
