// Modification d'un contact côté client (ouverte à tout membre connecté)
// Seuls les champs envoyés changent ; envoyer null (ou un texte vide) efface un champ facultatif.
interface LigneContact {
  prenom: string
  nom: string
  role: string | null
  entreprise_cliente_id: string | null
  mail: string | null
  telephone: string | null
  lien_linkedin: string | null
}

const champsModifiables = champsContact.partial().refine(donnees => Object.keys(donnees).length > 0, {
  message: 'Rien à modifier'
})

export default defineEventHandler(async (event) => {
  const session = await exigerSession(event)
  const { id } = await getValidatedRouterParams(event, identifiantContact.parse)
  const modifs = await lireCorps(event, champsModifiables)

  try {
    return await enTransaction(event, session.user.id, async (tx) => {
      const [actuel] = await tx<LigneContact[]>`
        SELECT prenom, nom, role, entreprise_cliente_id::text, mail, telephone, lien_linkedin
        FROM contact
        WHERE id = ${id}
        FOR UPDATE
      `
      if (!actuel) {
        throw createError({ statusCode: 404, statusMessage: 'Contact introuvable' })
      }

      const mail = modifs.mail === undefined ? actuel.mail : modifs.mail
      const telephone = modifs.telephone === undefined ? actuel.telephone : modifs.telephone
      const lienLinkedin = modifs.lienLinkedin === undefined ? actuel.lien_linkedin : modifs.lienLinkedin
      if (!contactAvecMoyenDeContact({ mail, telephone, lienLinkedin })) {
        throw createError({ statusCode: 400, statusMessage: MESSAGE_MOYEN_DE_CONTACT })
      }

      await tx`
        UPDATE contact
        SET prenom = ${modifs.prenom ?? actuel.prenom},
            nom = ${modifs.nom ?? actuel.nom},
            role = ${modifs.role === undefined ? actuel.role : modifs.role},
            entreprise_cliente_id = ${modifs.entrepriseId === undefined ? actuel.entreprise_cliente_id : modifs.entrepriseId},
            mail = ${mail},
            telephone = ${telephone},
            lien_linkedin = ${lienLinkedin}
        WHERE id = ${id}
      `
      return { id }
    })
  } catch (error) {
    throw erreurSql(error)
  }
})
