// Liste des profils extérieurs, du plus récemment sollicité au plus ancien
// La date est celle de la dernière sollicitation du profil ; un profil jamais sollicité arrive en fin de liste, sans date.
interface LigneProfil {
  id: string
  nom: string
  prenom: string
  technologies: string[]
  ville: string | null
  disponibilite: string | null
  date_sollicitation: string | null
}

export default defineEventHandler(async (event) => {
  await exigerSession(event)
  const sql = useDb(event)

  const lignes = await sql<LigneProfil[]>`
    SELECT id::text, nom, prenom, technologies, ville, disponibilite,
           to_char(date_sollicitation, 'YYYY-MM-DD') AS date_sollicitation
    FROM profil_exterieur_resume
    ORDER BY date_sollicitation DESC NULLS LAST, profil_exterieur_resume.id DESC
  `

  return lignes.map(l => ({
    id: l.id,
    nom: l.nom,
    prenom: l.prenom,
    technologies: l.technologies,
    ville: nullEnUndefined(l.ville),
    disponibilite: nullEnUndefined(l.disponibilite),
    dateSollicitation: nullEnUndefined(l.date_sollicitation)
  }))
})
