// Fiche d'un contact côté client
interface LigneContact {
  id: string
  nom: string
  prenom: string
  role: string | null
  entreprise_id: string | null
  entreprise: string | null
  mail: string | null
  telephone: string | null
  lien_linkedin: string | null
}

export default defineEventHandler(async (event) => {
  await exigerSession(event)
  const { id } = await getValidatedRouterParams(event, identifiantContact.parse)
  const sql = useDb(event)

  const [contact] = await sql<LigneContact[]>`
    SELECT c.id::text, c.nom, c.prenom, c.role, c.entreprise_cliente_id::text AS entreprise_id,
           e.nom AS entreprise, c.mail, c.telephone, c.lien_linkedin
    FROM contact c
    LEFT JOIN entreprise_cliente e ON e.id = c.entreprise_cliente_id
    WHERE c.id = ${id}
  `

  if (!contact) {
    throw createError({ statusCode: 404, statusMessage: 'Contact introuvable' })
  }

  return {
    id: contact.id,
    nom: contact.nom,
    prenom: contact.prenom,
    role: nullEnUndefined(contact.role),
    entrepriseId: nullEnUndefined(contact.entreprise_id),
    entreprise: nullEnUndefined(contact.entreprise),
    mail: nullEnUndefined(contact.mail),
    telephone: nullEnUndefined(contact.telephone),
    lienLinkedin: nullEnUndefined(contact.lien_linkedin)
  }
})
