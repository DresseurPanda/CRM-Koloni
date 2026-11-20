// Liste des entreprises clientes par ordre alphabétique (choix de l'entreprise d'un contact)
export default defineEventHandler(async (event) => {
  await exigerSession(event)
  const sql = useDb(event)

  return await sql<{ id: string, nom: string }[]>`
    SELECT id::text, nom
    FROM entreprise_cliente
    ORDER BY nom
  `
})
