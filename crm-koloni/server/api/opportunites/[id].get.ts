// Fiche complète d'une opportunité : la fiche, ses technologies, contacts, positionnements et notes,
// sa date d'ouverture à l'extérieur, et le fil qui réunit l'historique des statuts et le journal d'actions
import * as z from 'zod'
import { calculerActionsAutoriseesOpportunite } from '../../utils/droitsOpportunite'

const params = z.object({
  id: z.string().regex(/^\d+$/)
})

interface LigneOpportunite {
  id: string
  titre: string
  statut: string
  source: string | null
  type_mission: string | null
  niveau_recherche: string | null
  temperature: string | null
  client_final_id: string | null
  client_final: string | null
  client_final_secteur: string | null
  client_final_taille: string | null
  apporteur_id: string
  apporteur: string
  moteur_id: string | null
  saisi_par: string | null
  moteur: string | null
  preneur: string | null
  tjm_annonce: string | null
  tjm_client: string | null
  tjm_preneur: string | null
  duree_annoncee_mois: string | null
  nombre_jours: number | null
  charge: string | null
  ville: string | null
  mode: string | null
  timing: string | null
  mode_candidature: string | null
  mode_candidature_precision: string | null
  niveau_diffusion: string
  lien_annonce_exterieure: string | null
  date_signal: string
  date_cloture: string | null
  date_relance: string | null
  raison_perte: string | null
  qualifiee_par: string | null
  qualifiee_par_id: string | null
  date_qualification: string | null
  date_ouverture_exterieur: string | null
  positionne: boolean
}

interface LigneFil {
  date: string
  genre: 'statut' | 'action'
  auteur: string
  ancien_statut: string | null
  nouveau_statut: string | null
  motif: string | null
  date_relance: string | null
  type_action: string | null
  commentaire: string | null
}

// Les colonnes NUMERIC arrivent en texte avec postgres.js
const nombre = (valeur: string | null) => (valeur === null ? undefined : Number(valeur))

export default defineEventHandler(async (event) => {
  const session = await exigerSession(event)
  const { id } = await getValidatedRouterParams(event, params.parse)
  const sql = useDb(event)

  const [o] = await sql<LigneOpportunite[]>`
    SELECT
      o.id::text, o.titre, o.statut, o.source, o.type_mission, o.niveau_recherche, o.temperature,
      o.client_final_id::text, ec.nom AS client_final, o.client_final_secteur, o.client_final_taille,
      o.apporteur_id::text, a.prenom || ' ' || a.nom AS apporteur,
      s.prenom || ' ' || s.nom AS saisi_par,
      o.moteur_id::text, mo.prenom || ' ' || mo.nom AS moteur,
      o.qualifiee_par_id::text,
      EXISTS (
        SELECT 1
        FROM positionnement p
        WHERE p.opportunite_id = o.id
          AND p.membre_id = ${session.user.id}
          AND p.etat <> 'retire'
      ) AS positionne,
      COALESCE(pm.prenom || ' ' || pm.nom, pe.prenom || ' ' || pe.nom) AS preneur,
      o.tjm_annonce::text, o.tjm_client::text, o.tjm_preneur::text, o.duree_annoncee_mois::text, o.nombre_jours,
      o.charge, o.ville, o.mode, o.timing, o.mode_candidature, o.mode_candidature_precision,
      o.niveau_diffusion, o.lien_annonce_exterieure,
      to_char(o.date_signal, 'YYYY-MM-DD') AS date_signal,
      to_char(o.date_cloture, 'YYYY-MM-DD') AS date_cloture,
      to_char(o.date_relance, 'YYYY-MM-DD') AS date_relance,
      o.raison_perte,
      q.prenom || ' ' || q.nom AS qualifiee_par,
      to_char(o.date_qualification AT TIME ZONE 'Europe/Paris', 'YYYY-MM-DD') AS date_qualification,
      to_char(ouv.date_ouverture_exterieur, 'YYYY-MM-DD') AS date_ouverture_exterieur
    FROM opportunite o
    JOIN membre a ON a.id = o.apporteur_id
    LEFT JOIN membre s ON s.id = o.saisi_par_id
    LEFT JOIN membre mo ON mo.id = o.moteur_id
    LEFT JOIN membre pm ON pm.id = o.preneur_membre_id
    LEFT JOIN profil_exterieur pe ON pe.id = o.preneur_profil_exterieur_id
    LEFT JOIN membre q ON q.id = o.qualifiee_par_id
    LEFT JOIN entreprise_cliente ec ON ec.id = o.client_final_id
    LEFT JOIN opportunite_ouverture ouv ON ouv.id = o.id
    WHERE o.id = ${id}
  `
  if (!o) {
    throw createError({ statusCode: 404, statusMessage: 'Opportunité introuvable' })
  }
  const actionsAutorisees = calculerActionsAutoriseesOpportunite({
    role: session.role,
    membreId: session.user.id,
    apporteurId: o.apporteur_id,
    moteurId: o.moteur_id,
    modeCandidature: o.mode_candidature,
    statut: o.statut,
    qualifiee: o.qualifiee_par_id !== null,
    positionne: o.positionne
  })

  const [technologies, contacts, positionnements, notes, fil] = await Promise.all([
    // La technologie principale d'abord
    sql<{ nom: string, principale: boolean }[]>`
      SELECT t.nom, ot.est_principale AS principale
      FROM opportunite_technologie ot
      JOIN technologie t ON t.id = ot.technologie_id
      WHERE ot.opportunite_id = ${id}
      ORDER BY ot.est_principale DESC, t.nom
    `,
    sql<{ id: string, nom: string, prenom: string, role: string | null, entreprise: string | null, mail: string | null, telephone: string | null }[]>`
      SELECT c.id::text, c.nom, c.prenom, c.role, c.entreprise, c.mail, c.telephone
      FROM opportunite_contact oc
      JOIN contact_resume c ON c.id = oc.contact_id
      WHERE oc.opportunite_id = ${id}
      ORDER BY c.nom, c.prenom
    `,
    sql<{ membre_id: string, nom: string, prenom: string, mail: string, etat: string, date: string, commentaire: string | null }[]>`
      SELECT p.membre_id::text, m.nom, m.prenom, m.mail, p.etat,
             to_char(p.date_positionnement, 'YYYY-MM-DD') AS date, p.commentaire
      FROM positionnement p
      JOIN membre m ON m.id = p.membre_id
      WHERE p.opportunite_id = ${id}
      ORDER BY p.date_positionnement, p.id
    `,
    // Notes de la plus récente à la plus ancienne
    sql<{ id: string, auteur: string, date: string, contenu: string }[]>`
      SELECT n.id::text, m.prenom || ' ' || m.nom AS auteur,
             to_char(n.date_redaction AT TIME ZONE 'Europe/Paris', 'YYYY-MM-DD"T"HH24:MI') AS date, n.contenu
      FROM note n
      JOIN membre m ON m.id = n.auteur_id
      WHERE n.opportunite_id = ${id}
      ORDER BY n.date_redaction DESC, n.id DESC
    `,
    // Fil : changements de statut et actions du journal, du plus récent au plus ancien
    sql<LigneFil[]>`
      SELECT date, genre, auteur, ancien_statut, nouveau_statut, motif, date_relance, type_action, commentaire
      FROM (
        SELECT h.date_changement AS horodatage, h.id AS ordre, 'statut' AS genre, m.prenom || ' ' || m.nom AS auteur,
               h.ancien_statut, h.nouveau_statut, h.motif, to_char(h.date_relance, 'YYYY-MM-DD') AS date_relance,
               NULL AS type_action, NULL AS commentaire
        FROM historique_statut h
        JOIN membre m ON m.id = h.auteur_id
        WHERE h.opportunite_id = ${id}
        UNION ALL
        SELECT j.date_action, j.id, 'action', m.prenom || ' ' || m.nom,
               NULL, NULL, NULL, NULL, j.type_action, j.commentaire
        FROM journal_action j
        JOIN membre m ON m.id = j.auteur_id
        WHERE j.opportunite_id = ${id}
      ) evenements
      CROSS JOIN LATERAL (SELECT to_char(horodatage AT TIME ZONE 'Europe/Paris', 'YYYY-MM-DD"T"HH24:MI') AS date) d
      -- À heure égale (données saisies dans la même transaction), l'ordre d'insertion départage
      ORDER BY horodatage DESC, ordre DESC
    `
  ])

  return {
    id: o.id,
    titre: o.titre,
    statut: libelleStatut(o.statut),
    source: libelleSource(o.source),
    typeMission: nullEnUndefined(o.type_mission),
    niveauRecherche: libelleNiveau(o.niveau_recherche),
    temperature: libelleTemperature(o.temperature),
    clientFinal: nullEnUndefined(o.client_final),
    clientFinalSecteur: nullEnUndefined(o.client_final_secteur),
    clientFinalTaille: nullEnUndefined(o.client_final_taille),
    apporteur: o.apporteur,
    saisiPar: nullEnUndefined(o.saisi_par),
    moteur: nullEnUndefined(o.moteur),
    preneur: nullEnUndefined(o.preneur),
    actionsAutorisees,
    tjmAnnonce: nombre(o.tjm_annonce),
    tjmClient: nombre(o.tjm_client),
    tjmPreneur: nombre(o.tjm_preneur),
    dureeAnnonceeMois: nombre(o.duree_annoncee_mois),
    nombreJours: o.nombre_jours ?? undefined,
    charge: nullEnUndefined(o.charge),
    ville: nullEnUndefined(o.ville),
    mode: libelleMode(o.mode),
    timing: libelleTiming(o.timing),
    modeCandidature: libelleModeCandidature(o.mode_candidature),
    modeCandidaturePrecision: nullEnUndefined(o.mode_candidature_precision),
    niveauDiffusion: libelleNiveauDiffusion(o.niveau_diffusion),
    lienAnnonceExterieure: nullEnUndefined(o.lien_annonce_exterieure),
    dateSignal: o.date_signal,
    dateCloture: nullEnUndefined(o.date_cloture),
    dateRelance: nullEnUndefined(o.date_relance),
    raisonPerte: nullEnUndefined(o.raison_perte),
    qualifieePar: nullEnUndefined(o.qualifiee_par),
    dateQualification: nullEnUndefined(o.date_qualification),
    dateOuvertureExterieur: nullEnUndefined(o.date_ouverture_exterieur),
    // Codes bruts, pour préremplir les formulaires de modification
    codes: {
      statut: o.statut,
      source: nullEnUndefined(o.source),
      niveauRecherche: nullEnUndefined(o.niveau_recherche),
      temperature: nullEnUndefined(o.temperature),
      mode: nullEnUndefined(o.mode),
      timing: nullEnUndefined(o.timing),
      modeCandidature: nullEnUndefined(o.mode_candidature),
      niveauDiffusion: o.niveau_diffusion,
      clientFinalId: nullEnUndefined(o.client_final_id),
      apporteurId: o.apporteur_id,
      moteurId: nullEnUndefined(o.moteur_id)
    },
    technologies,
    contacts: contacts.map(c => ({
      id: c.id,
      nom: c.nom,
      prenom: c.prenom,
      role: nullEnUndefined(c.role),
      entreprise: nullEnUndefined(c.entreprise),
      mail: nullEnUndefined(c.mail),
      telephone: nullEnUndefined(c.telephone)
    })),
    positionnements: positionnements.map(p => ({
      membreId: p.membre_id,
      nom: p.nom,
      prenom: p.prenom,
      mail: p.mail,
      etat: libelleEtatPositionnement(p.etat),
      etatCode: p.etat,
      date: p.date,
      commentaire: nullEnUndefined(p.commentaire)
    })),
    notes,
    fil: fil.map(e => e.genre === 'statut'
      ? {
          date: e.date,
          auteur: e.auteur,
          titre: e.ancien_statut
            ? `Statut : ${libelleStatut(e.ancien_statut)} → ${libelleStatut(e.nouveau_statut!)}`
            : `Opportunité publiée au statut ${libelleStatut(e.nouveau_statut!)}`,
          detail: e.motif ?? (e.date_relance ? `Relance le ${formaterDate(e.date_relance)}` : undefined)
        }
      : {
          date: e.date,
          auteur: e.auteur,
          titre: libelleTypeAction(e.type_action!),
          detail: nullEnUndefined(e.commentaire)
        })
  }
})
