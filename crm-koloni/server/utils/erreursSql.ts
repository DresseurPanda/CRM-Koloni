/**
 * Traduction des erreurs PostgreSQL en erreurs HTTP
 *
 * La base porte les règles métier (contraintes, triggers) : quand elle refuse une écriture,
 * l'API renvoie un message clair au lieu d'une erreur 500.
 * À appeler dans le catch d'une route : `throw erreurSql(error)`.
 */

import postgres from 'postgres'

// Messages affichés à l'utilisateur, par nom de contrainte ou d'index violé
const MESSAGES: Record<string, string> = {
  uq_membre_mail: 'Un compte existe déjà avec cette adresse mail',
  uq_membre_mail_minuscule: 'Un compte existe déjà avec cette adresse mail',
  uq_technologie_nom_minuscule: 'Cette technologie existe déjà',
  uq_entreprise_cliente_nom_minuscule: 'Cette entreprise existe déjà',
  uq_positionnement_membre_opportunite: 'Ce membre est déjà positionné sur cette opportunité',
  opportunite_contact_pkey: 'Ce contact est déjà rattaché à cette opportunité',
  opportunite_contact_contact_id_fkey: 'Contact introuvable',
  chk_opp_raison_perte_obligatoire: 'La raison de la perte est obligatoire',
  chk_opp_date_relance_obligatoire: 'La date de relance est obligatoire pour une opportunité en pause',
  chk_opp_signe_complet: 'Le preneur, son TJM et le nombre de jours sont obligatoires pour une opportunité signée',
  chk_opp_preneur_exclusif: 'Le preneur est soit un membre, soit un profil extérieur, pas les deux',
  chk_contact_moyen_contact: 'Renseigner au moins un mail, un téléphone ou un lien LinkedIn',
  chk_membre_linkedin: 'Lien LinkedIn invalide',
  chk_membre_disponibilite: 'Disponibilité inconnue',
  chk_membre_date_disponibilite: 'La date ne s\'indique que pour un membre en mission ou à l\'écoute',
  chk_membre_ville_format: 'La ville ne peut pas être vide',
  chk_contact_linkedin: 'Lien LinkedIn invalide',
  chk_profil_ext_linkedin: 'Lien LinkedIn invalide'
}

// Erreur levée par un trigger pour signaler un oubli de l'application (auteur non défini) : jamais montrée à l'utilisateur
const ERREUR_INTERNE_TRIGGER = 'app.current_membre_id'

export const erreurSql = (error: unknown) => {
  if (!(error instanceof postgres.PostgresError)) return error

  const message = MESSAGES[error.constraint_name ?? '']

  switch (error.code) {
    case '23505': // unique_violation
      return createError({ statusCode: 409, statusMessage: message ?? 'Cet élément existe déjà' })
    case '23514': // check_violation
      return createError({ statusCode: 400, statusMessage: message ?? 'Données invalides' })
    case '23502': // not_null_violation
    case '22P02': // invalid_text_representation
    case '23503': // foreign_key_violation
      return createError({ statusCode: 400, statusMessage: message ?? 'Données invalides ou élément lié introuvable' })
    case 'P0001': // raise_exception : règle métier d'un trigger
      return error.message.includes(ERREUR_INTERNE_TRIGGER)
        ? error
        : createError({ statusCode: 409, statusMessage: error.message })
    default:
      return error
  }
}
