// Liste des opportunités, de la plus récente à la plus ancienne (date du signal)
interface LigneOpportunite {
  id: string
  titre: string
  statut: string
  technologies: string[]
  ville: string | null
  mode: string | null
  client_final: string | null
  apporteur: string
  temperature: string | null
  date_signal: string
}

export default defineEventHandler(async (event) => {
  await exigerSession(event)
  const sql = useDb(event)

  // opportunite_resume réunit déjà les technologies (la principale d'abord), le client final et l'apporteur
  const lignes = await sql<LigneOpportunite[]>`
    SELECT id::text, titre, statut, technologies, ville, mode, client_final, apporteur, temperature,
           to_char(date_signal, 'YYYY-MM-DD') AS date_signal
    FROM opportunite_resume
    ORDER BY opportunite_resume.date_signal DESC, opportunite_resume.id DESC
  `

  return lignes.map(l => ({
    id: l.id,
    titre: l.titre,
    statut: libelleStatut(l.statut),
    technologies: l.technologies,
    ville: nullEnUndefined(l.ville),
    mode: libelleMode(l.mode),
    clientFinal: nullEnUndefined(l.client_final),
    apporteur: l.apporteur,
    temperature: libelleTemperature(l.temperature),
    dateSignal: l.date_signal
  }))
})
