/**
 * Règles de validation d'un membre, communes à la création et à la modification
 *
 * Un champ facultatif vide ("" ou espaces) est enregistré comme absent (NULL).
 * Ces règles reprennent celles de la table membre : la base reste la dernière barrière.
 */

import * as z from 'zod'
import { DISPONIBILITES_DATEES, LIBELLES_DISPONIBILITE, Role } from '#shared/types/utilisateur'
import type { Disponibilite } from '#shared/types/utilisateur'

// "" et espaces -> null, pour qu'un champ vidé dans un formulaire efface la valeur en base
const videEnNull = (valeur: unknown) =>
  typeof valeur === 'string' && valeur.trim() === '' ? null : valeur

const facultatif = <T extends z.ZodType>(schema: T) => z.preprocess(videEnNull, schema.nullable())

export const champsMembre = {
  nom: z.string().trim().min(1).max(100),
  prenom: z.string().trim().min(1).max(100),
  mail: z.email().max(255).transform(mail => mail.toLowerCase()),
  telephone: facultatif(z.string().trim().max(30)),
  lien_linkedin: facultatif(z.string().trim().max(255).regex(/^https:\/\/([\w-]+\.)*linkedin\.com\/\S*$/i, 'Lien LinkedIn invalide')),
  notes: facultatif(z.string().trim().max(5000)),
  role: z.enum(Role),
  ville: facultatif(z.string().trim().max(100)),
  // Les quatre états de la base (chk_membre_disponibilite)
  disponibilite: z.enum(Object.keys(LIBELLES_DISPONIBILITE) as [Disponibilite, ...Disponibilite[]]),
  date_disponibilite: facultatif(z.iso.date())
}

export const motDePasse = z.string().min(8).max(200)

// La date n'a de sens qu'en mission (fin de mission) ou à l'écoute (date de disponibilité) :
// chk_membre_date_disponibilite la refuse pour les deux autres états
export const dateDisponibiliteAutorisee = (disponibilite: Disponibilite, date: string | null | undefined) =>
  DISPONIBILITES_DATEES.includes(disponibilite) ? (date ?? null) : null
