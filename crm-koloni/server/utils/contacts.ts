/**
 * Validation partagée par les routes des contacts
 *
 * Un champ facultatif vide devient NULL. Les règles que la base garantit déjà (au moins un moyen
 * de contact, lien LinkedIn, doublon de LinkedIn) y restent la référence : la route les contrôle
 * pour répondre vite, et erreurSql traduit le refus si une règle lui échappe.
 */

import * as z from 'zod'

export const identifiantContact = z.object({
  id: z.string().regex(/^\d+$/)
})

const texteFacultatif = (longueurMax: number) =>
  z.string().trim().max(longueurMax).transform(texte => texte === '' ? null : texte).nullish()

export const champsContact = z.object({
  prenom: z.string().trim().min(1).max(100),
  nom: z.string().trim().min(1).max(100),
  role: texteFacultatif(150),
  entrepriseId: z.string().regex(/^\d+$/).nullish(),
  mail: z.string().trim().max(255).transform(texte => texte === '' ? null : texte)
    .pipe(z.email().nullable()).nullish(),
  telephone: texteFacultatif(30),
  lienLinkedin: z.string().trim().max(255).transform(texte => texte === '' ? null : texte)
    .pipe(z.string().regex(/^https:\/\/.*linkedin\.com\//, 'Lien LinkedIn invalide').nullable()).nullish()
})

export const contactAvecMoyenDeContact = (contact: { mail?: string | null, telephone?: string | null, lienLinkedin?: string | null }) =>
  Boolean(contact.mail || contact.telephone || contact.lienLinkedin)

export const MESSAGE_MOYEN_DE_CONTACT = 'Renseigner au moins un mail, un téléphone ou un lien LinkedIn'
