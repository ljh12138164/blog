import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { journalCredentials } from './schema'

export async function savePasswordHash(url: string, passwordHash: string, initializeOnly = false) {
  if (!passwordHash.startsWith('$argon2id$')) throw new Error('Expected an Argon2id password hash')
  const client = postgres(url, { max: 1, connect_timeout: 5, onnotice: () => {} })
  try {
    const insert = drizzle(client).insert(journalCredentials).values({ id: 'owner', passwordHash })
    if (initializeOnly) await insert.onConflictDoNothing()
    else await insert.onConflictDoUpdate({ target: journalCredentials.id, set: { passwordHash } })
  } finally {
    await client.end({ timeout: 5 })
  }
}
