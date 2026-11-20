// Création d'un compte membre, réservée aux administrateurs (EF-02)
// L'administrateur choisit le mot de passe initial. La création d'un compte n'est pas journalisée :
// le journal ne trace que les actions menées sur une opportunité.
import * as z from 'zod'
import { Role } from '#shared/types/utilisateur'

const schema = z.object({
  nom: champsMembre.nom,
  prenom: champsMembre.prenom,
  mail: champsMembre.mail,
  password: motDePasse,
  telephone: champsMembre.telephone.optional(),
  lien_linkedin: champsMembre.lien_linkedin.optional(),
  notes: champsMembre.notes.optional(),
  role: champsMembre.role.default(Role.membre),
  ville: champsMembre.ville.optional(),
  // Un compte neuf n'a encore rien déclaré (valeur par défaut de la base)
  disponibilite: champsMembre.disponibilite.default('inconnu'),
  date_disponibilite: champsMembre.date_disponibilite.optional()
})

export default defineEventHandler(async (event) => {
  await exigerAdmin(event)
  const corps = await lireCorps(event, schema)
  const sql = useDb(event)

  const hash = await hashPassword(corps.password)
  const dateDisponibilite = dateDisponibiliteAutorisee(corps.disponibilite, corps.date_disponibilite)

  try {
    const [membre] = await sql<{ id: string }[]>`
      INSERT INTO membre (nom, prenom, mail, telephone, lien_linkedin, notes, role, ville,
                          disponibilite, date_disponibilite, mot_de_passe_hash)
      VALUES (${corps.nom}, ${corps.prenom}, ${corps.mail}, ${corps.telephone ?? null},
              ${corps.lien_linkedin ?? null}, ${corps.notes ?? null}, ${corps.role}, ${corps.ville ?? null},
              ${corps.disponibilite}, ${dateDisponibilite}::date, ${hash})
      RETURNING id::text
    `
    setResponseStatus(event, 201)
    return { id: membre!.id }
  } catch (error) {
    throw erreurSql(error)
  }
})
