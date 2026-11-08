import type { H3Event } from 'h3'
import { Role } from '#shared/types/utilisateur'
import { exigerSession } from './auth'

export type ActionOpportunite =
  | 'qualifier'
  | 'sePositionner'
  | 'choisirProfils'
  | 'changerStatut'
  | 'cloturer'
  | 'ajouterNote'
  | 'gererContacts'

export type ActionsAutoriseesOpportunite = Record<ActionOpportunite, boolean>

interface ContexteDroitsOpportunite {
  role: Role
  membreId: string
  apporteurId: string
  moteurId: string | null
  modeCandidature: string | null
  statut: string
  qualifiee: boolean
  positionne: boolean
}

interface LigneDroitsOpportunite {
  apporteur_id: string
  moteur_id: string | null
  mode_candidature: string | null
  statut: string
  qualifiee: boolean
  positionne: boolean
}

export const calculerActionsAutoriseesOpportunite = ({
  role,
  membreId,
  apporteurId,
  moteurId,
  modeCandidature,
  statut,
  qualifiee,
  positionne
}: ContexteDroitsOpportunite): ActionsAutoriseesOpportunite => {
  const administrateur = role === Role.admin
  const apporteur = membreId === apporteurId
  const moteur = membreId === moteurId
  const membreAutoriseAChangerStatut = administrateur
    || apporteur
    || moteur
    || (modeCandidature === 'contact_direct_recruteur' && positionne)

  return {
    qualifier: statut === 'signal' && !qualifiee && (administrateur || apporteur),
    sePositionner: statut === 'signal' || statut === 'matching',
    choisirProfils: !administrateur && (apporteur || moteur),
    changerStatut: membreAutoriseAChangerStatut,
    cloturer: membreAutoriseAChangerStatut,
    ajouterNote: true,
    gererContacts: true
  }
}

export const exigerActionOpportunite = async (
  event: H3Event,
  opportuniteId: string,
  action: ActionOpportunite
) => {
  const session = await exigerSession(event)
  const [opportunite] = await useDb(event)<LigneDroitsOpportunite[]>`
    SELECT
      o.apporteur_id::text,
      o.moteur_id::text,
      o.mode_candidature,
      o.statut,
      (o.qualifiee_par_id IS NOT NULL) AS qualifiee,
      EXISTS (
        SELECT 1
        FROM positionnement p
        WHERE p.opportunite_id = o.id
          AND p.membre_id = ${session.user.id}
          AND p.etat <> 'retire'
      ) AS positionne
    FROM opportunite o
    WHERE o.id = ${opportuniteId}
  `

  if (!opportunite) {
    throw createError({ statusCode: 404, statusMessage: 'Opportunité introuvable' })
  }

  const actionsAutorisees = calculerActionsAutoriseesOpportunite({
    role: session.role,
    membreId: session.user.id,
    apporteurId: opportunite.apporteur_id,
    moteurId: opportunite.moteur_id,
    modeCandidature: opportunite.mode_candidature,
    statut: opportunite.statut,
    qualifiee: opportunite.qualifiee,
    positionne: opportunite.positionne
  })

  if (!actionsAutorisees[action]) {
    throw createError({ statusCode: 403, statusMessage: 'Action non autorisée sur cette opportunité' })
  }
}
