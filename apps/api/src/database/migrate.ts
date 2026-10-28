import { resolve } from 'node:path'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

export async function migrateDatabase(url: string) {
  const client = postgres(url, { max: 1, connect_timeout: 5, onnotice: () => {} })
  try {
    await migrate(drizzle(client), { migrationsFolder: resolve(__dirname, '../../drizzle') })
  } finally {
    await client.end({ timeout: 5 })
  }
}

if (require.main === module) {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is required')
  migrateDatabase(url).catch(() => {
    console.error('Database migration failed; check connection and migration files')
    process.exitCode = 1
  })
}
