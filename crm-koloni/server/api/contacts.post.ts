// Création d'un contact côté client (ouverte à tout membre connecté)
export default defineEventHandler(async (event) => {
  const session = await exigerSession(event)
  const contact = await lireCorps(event, champsContact)

  if (!contactAvecMoyenDeContact(contact)) {
    throw createError({ statusCode: 400, statusMessage: MESSAGE_MOYEN_DE_CONTACT })
  }

  try {
    const [cree] = await enTransaction(event, session.user.id, tx => tx<{ id: string }[]>`
      INSERT INTO contact (prenom, nom, role, entreprise_cliente_id, mail, telephone, lien_linkedin)
      VALUES (${contact.prenom}, ${contact.nom}, ${contact.role ?? null}, ${contact.entrepriseId ?? null},
              ${contact.mail ?? null}, ${contact.telephone ?? null}, ${contact.lienLinkedin ?? null})
      RETURNING id::text
    `)
    setResponseStatus(event, 201)
    return { id: cree!.id }
  } catch (error) {
    throw erreurSql(error)
  }
})
