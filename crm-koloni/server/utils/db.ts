/**
 * Accès à la base PostgreSQL
 *
 * Le pool de connexions est créé au premier appel, puis réutilisé par toutes les routes.
 * Les paramètres viennent de runtimeConfig.database (variables NUXT_DATABASE_*).
 */

import type { H3Event } from 'h3'
import postgres from 'postgres'

let sql: postgres.Sql | undefined

export const useDb = (event: H3Event) => {
  if (!sql) {
    const { host, port, name, user, password } = useRuntimeConfig(event).database
    sql = postgres({
      host,
      port: Number(port),
      database: name,
      username: user,
      password,
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10
    })
  }
  return sql
}

/**
 * Exécute une écriture dans une transaction dont l'auteur est le membre connecté
 *
 * Les triggers de la base lisent l'auteur dans app.current_membre_id pour remplir le journal et
 * refusent l'écriture s'il manque. `set_config(..., true)` le limite à la transaction : jamais
 * de SET de session avec un pool, l'identifiant d'un membre passerait à la requête suivante.
 */
export const enTransaction = <T>(event: H3Event, membreId: string, action: (tx: postgres.TransactionSql) => Promise<T>) =>
  useDb(event).begin(async (tx) => {
    await tx`SELECT set_config('app.current_membre_id', ${membreId}, true)`
    return action(tx)
  }) as Promise<T>
