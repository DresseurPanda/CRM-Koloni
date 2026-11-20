// Liste des contacts côté client, par ordre alphabétique
interface LigneContact {
  id: string
  nom: string
  prenom: string
  role: string | null
  entreprise: string | null
  mail: string | null
  telephone: string | null
}

export default defineEventHandler(async (event) => {
  await exigerSession(event)
  const sql = useDb(event)

  const lignes = await sql<LigneContact[]>`
    SELECT id::text, nom, prenom, role, entreprise, mail, telephone
    FROM contact_resume
    ORDER BY nom, prenom
  `

  return lignes.map(l => ({
    id: l.id,
    nom: l.nom,
    prenom: l.prenom,
    role: nullEnUndefined(l.role),
    entreprise: nullEnUndefined(l.entreprise),
    mail: nullEnUndefined(l.mail),
    telephone: nullEnUndefined(l.telephone)
  }))
})
