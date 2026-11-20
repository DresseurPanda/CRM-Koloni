import * as z from 'zod'
import type { ObjetCree } from '#shared/types/referentiels'

const schema = z.object({
  titre: z.string().trim().min(1).max(255),
  // Codes acceptés : ceux des listes de shared/utils/opportunites.ts
  source: z.enum(codesDe(LIBELLES_SOURCE)).optional(),
  typeMission: z.string().trim().max(50).optional(),
  niveauRecherche: z.enum(codesDe(LIBELLES_NIVEAU)).optional(),
  apporteurId: z.string().regex(/^\d+$/),
  // null quand le champ a été vidé dans le formulaire
  moteurId: z.string().regex(/^\d+$/).nullish().or(z.literal('')),
  clientFinal: z.string().trim().max(255).optional(),
  clientFinalSecteur: z.string().trim().max(150).optional(),
  clientFinalTaille: z.string().trim().max(50).optional(),
  ville: z.string().trim().max(100).optional(),
  mode: z.enum(codesDe(LIBELLES_MODE)).optional(),
  temperature: z.enum(codesDe(LIBELLES_TEMPERATURE)).optional(),
  tjmAnnonce: z.number().nonnegative().optional(),
  tjmClient: z.number().nonnegative().optional(),
  dureeAnnonceeMois: z.number().positive().optional(),
  charge: z.string().trim().max(50).optional(),
  timing: z.enum(codesDe(LIBELLES_TIMING)).optional(),
  modeCandidature: z.enum(codesDe(LIBELLES_MODE_CANDIDATURE)).optional(),
  modeCandidaturePrecision: z.string().trim().max(255).optional(),
  niveauDiffusion: z.enum(codesDe(LIBELLES_NIVEAU_DIFFUSION)).default('reseau_perso'),
  lienAnnonceExterieure: z.url().refine(url => url.startsWith('https://'), 'Le lien doit commencer par https://').optional(),
  dateSignal: z.iso.date(),
  technologies: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  technologiePrincipale: z.string().trim().min(1).max(100).optional()
}).refine(data => !data.technologiePrincipale || data.technologies.includes(data.technologiePrincipale), {
  path: ['technologiePrincipale'],
  message: 'La technologie principale doit faire partie des technologies choisies.'
})

export default defineEventHandler(async (event) => {
  const session = await exigerSession(event)
  const body = await lireCorps(event, schema)
  const sql = useDb(event)

  const [membreApporteur] = await sql<{ id: string }[]>`
    SELECT id::text FROM membre WHERE id = ${body.apporteurId} AND actif = TRUE
  `
  if (!membreApporteur) {
    throw createError({ statusCode: 400, statusMessage: 'L’apporteur sélectionné est introuvable ou inactif.' })
  }

  if (body.moteurId) {
    const [moteur] = await sql<{ id: string }[]>`
      SELECT id::text FROM membre WHERE id = ${body.moteurId} AND actif = TRUE
    `
    if (!moteur) {
      throw createError({ statusCode: 400, statusMessage: 'Le moteur sélectionné est introuvable ou inactif.' })
    }
  }

  // Entreprise ou technologie créée par cette opportunité : renvoyée pour que la page propose de la compléter
  // (xmax, colonne système de PostgreSQL, vaut 0 sur une ligne tout juste insérée, et non retrouvée par ON CONFLICT)
  const objetsCrees: { entreprises: ObjetCree[], technologies: ObjetCree[] } = { entreprises: [], technologies: [] }

  // enTransaction transmet l'auteur à la base
  const identifiant = await enTransaction(event, session.user.id, async (transaction) => {
    let clientId: string | null = null
    if (body.clientFinal) {
      const [client] = await transaction<{ id: string, nom: string, est_nouvelle: boolean }[]>`
        INSERT INTO entreprise_cliente (nom) VALUES (${body.clientFinal})
        ON CONFLICT (lower(btrim(nom))) DO UPDATE SET nom = entreprise_cliente.nom
        RETURNING id::text, nom, (xmax = 0) AS est_nouvelle
      `
      clientId = client!.id
      if (client!.est_nouvelle) objetsCrees.entreprises.push({ id: client!.id, nom: client!.nom })
    }

    const technologies = [...new Map(body.technologies.map(nom => [nom.toLocaleLowerCase('fr'), nom])).values()]
    const [opportunite] = await transaction<{ id: string }[]>`
      INSERT INTO opportunite (
        titre, source, type_mission, niveau_recherche,
        client_final_id, client_final_secteur, client_final_taille,
        apporteur_id, saisi_par_id, moteur_id,
        tjm_annonce, duree_annoncee_mois, tjm_client, charge,
        ville, mode, timing, mode_candidature, mode_candidature_precision,
        niveau_diffusion, lien_annonce_exterieure, temperature, date_signal
      ) VALUES (
        ${body.titre}, ${body.source ?? null}, ${body.typeMission || null}, ${body.niveauRecherche ?? null},
        ${clientId}, ${clientId ? null : body.clientFinalSecteur || null}, ${clientId ? null : body.clientFinalTaille || null},
        ${body.apporteurId}, ${body.apporteurId === session.user.id ? null : session.user.id}, ${body.moteurId || null},
        ${body.tjmAnnonce ?? null}, ${body.dureeAnnonceeMois ?? null}, ${body.tjmClient ?? null}, ${body.charge || null},
        ${body.ville || null}, ${body.mode ?? null}, ${body.timing ?? null}, ${body.modeCandidature ?? null}, ${body.modeCandidaturePrecision || null},
        ${body.niveauDiffusion}, ${body.lienAnnonceExterieure ?? null}, ${body.temperature ?? null}, ${body.dateSignal}
      )
      RETURNING id::text
    `

    for (const nom of technologies) {
      const [technologie] = await transaction<{ id: string, nom: string, est_nouvelle: boolean }[]>`
        INSERT INTO technologie (nom) VALUES (${nom})
        ON CONFLICT (lower(btrim(nom))) DO UPDATE SET nom = technologie.nom
        RETURNING id::text, nom, (xmax = 0) AS est_nouvelle
      `
      if (technologie!.est_nouvelle) objetsCrees.technologies.push({ id: technologie!.id, nom: technologie!.nom })
      await transaction`
        INSERT INTO opportunite_technologie (opportunite_id, technologie_id, est_principale)
        VALUES (${opportunite!.id}, ${technologie!.id}, ${nom === body.technologiePrincipale})
        ON CONFLICT (opportunite_id, technologie_id) DO UPDATE SET est_principale = EXCLUDED.est_principale
      `
    }

    return opportunite!.id
  })

  setResponseStatus(event, 201)
  return { id: identifiant, objetsCrees }
})
