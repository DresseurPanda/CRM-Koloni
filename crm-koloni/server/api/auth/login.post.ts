// Connexion : vérifie le mail et le mot de passe, puis ouvre la session
import * as z from 'zod'
import type { Role } from '#shared/types/utilisateur'

interface LigneMembre {
  id: string
  nom: string
  prenom: string
  mail: string
  role: Role
  actif: boolean
  mot_de_passe_hash: string | null
}

const schema = z.object({
  mail: z.email(),
  password: z.string().min(1)
})

// Hash d'un mot de passe quelconque : vérifié quand le mail est inconnu, pour que le temps de réponse ne révèle pas si le compte existe
const HASH_FICTIF = '$scrypt$n=16384,r=8,p=1$DL6Gl8JLEOmEo4pE79bxPQ$0zrAQZZdzQt1ZL+Bqryu7929gh8UXWYWeJQT2MAMaejWLxoxTDApIk6PxjbBYzqVvs4G4vALyzWjcna6a7q3Qg'

export default defineEventHandler(async (event) => {
  const { mail, password } = await lireCorps(event, schema)
  const sql = useDb(event)

  const [membre] = await sql<LigneMembre[]>`
    SELECT id::text, nom, prenom, mail, role, actif, mot_de_passe_hash
    FROM membre
    WHERE lower(mail) = lower(${mail})
  `

  const valide = await verifyPassword(membre?.mot_de_passe_hash ?? HASH_FICTIF, password)
  if (!membre || !membre.actif || !valide) {
    throw createError({ statusCode: 401, statusMessage: 'Adresse mail ou mot de passe incorrect' })
  }

  await setUserSession(event, {
    user: { id: membre.id, nom: membre.nom, prenom: membre.prenom, mail: membre.mail },
    role: membre.role
  })

  return { id: membre.id, role: membre.role }
})
