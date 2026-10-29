export const API_CONFIG = Symbol('API_CONFIG')

export function readConfig(env: Record<string, string | undefined> = process.env) {
  const databaseUrl = env.DATABASE_URL
  if (!databaseUrl || !/^postgres(ql)?:\/\//.test(databaseUrl)) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL')
  }
  const port = Number(env.PORT ?? 3001)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT')
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must contain at least 32 characters')
  }
  if (env.COOKIE_SECURE && !['true', 'false'].includes(env.COOKIE_SECURE)) {
    throw new Error('COOKIE_SECURE must be true or false')
  }
  if (env.NODE_ENV === 'production' && env.COOKIE_SECURE !== 'true') {
    throw new Error('Production requires COOKIE_SECURE=true and HTTPS')
  }
  return {
    databaseUrl,
    port,
    host: env.HOST ?? '127.0.0.1',
    sessionSecret: env.SESSION_SECRET,
    secureCookie: env.COOKIE_SECURE === 'true'
  }
}

export type ApiConfig = ReturnType<typeof readConfig>
