import 'reflect-metadata'
import { beforeAll, describe, expect, test } from 'bun:test'
import { AuthService } from '../src/auth'
import { readConfig } from '../src/config'
import type { DatabaseService } from '../src/database/database.service'
import { parseNote } from '../src/notes'

const env = {
  DATABASE_URL: 'postgres://test@localhost/blog_test',
  SESSION_SECRET: 'test-session-secret-with-at-least-32-characters'
}

describe('configuration', () => {
  test('requires database and session secret but no environment password', () => {
    expect(() => readConfig({})).toThrow('DATABASE_URL')
    expect(() => readConfig({ ...env, PORT: '0' })).toThrow('PORT')
    expect(() => readConfig({ ...env, SESSION_SECRET: 'short' })).toThrow('SESSION_SECRET')
    expect(() => readConfig({ ...env, NODE_ENV: 'production' })).toThrow('HTTPS')
    expect(readConfig({ ...env, NODE_ENV: 'production', COOKIE_SECURE: 'true' }).secureCookie).toBe(
      true
    )
    expect(readConfig(env)).not.toHaveProperty('passwordHash')
  })
})

describe('owner authentication', () => {
  let auth: AuthService
  let passwordHash: string | undefined
  const database = {
    db: {
      query: {
        journalCredentials: { findFirst: async () => (passwordHash ? { passwordHash } : undefined) }
      }
    }
  } as unknown as DatabaseService

  beforeAll(async () => {
    passwordHash = await Bun.password.hash('test-password-only')
    auth = new AuthService(readConfig(env), database)
  })

  test('checks database password and rejects missing or non-string values', async () => {
    expect(await auth.login('test-password-only')).toBeString()
    for (const value of ['wrong', undefined, {}, 'a'.repeat(1025)]) {
      expect(await auth.login(value)).toBeUndefined()
    }
  })

  test('rejects tampered, expired, malformed and rotated-secret sessions', async () => {
    const now = 1000000
    const session = await auth.login('test-password-only', now)
    expect(await auth.isValid(session, now)).toBe(true)
    expect(await auth.isValid(`${session}a`, now)).toBe(false)
    expect(await auth.isValid(session, now + 7 * 24 * 60 * 60 * 1000)).toBe(false)
    expect(await auth.isValid('garbage', now)).toBe(false)
    const rotated = new AuthService(
      readConfig({ ...env, SESSION_SECRET: 'a-different-secret-with-at-least-32-characters' }),
      database
    )
    expect(await rotated.isValid(session, now)).toBe(false)
    expect(auth.cookie(session ?? '')).toContain('HttpOnly')
    expect(auth.cookie(session ?? '')).toContain('SameSite=Strict')
    expect(auth.cookie(session ?? '')).not.toContain('Secure;')
  })

  test('rejects login and existing sessions when the credential is absent', async () => {
    const session = await auth.login('test-password-only')
    const original = passwordHash
    try {
      passwordHash = undefined
      expect(await auth.login('test-password-only')).toBeUndefined()
      expect(await auth.isValid(session)).toBe(false)
    } finally {
      passwordHash = original
    }
  })

  test('password replacement immediately rejects old password and sessions', async () => {
    const session = await auth.login('test-password-only')
    const original = passwordHash
    try {
      passwordHash = await Bun.password.hash('replacement-password')
      expect(await auth.login('test-password-only')).toBeUndefined()
      expect(await auth.isValid(session)).toBe(false)
      expect(await auth.isValid(await auth.login('replacement-password'))).toBe(true)
    } finally {
      passwordHash = original
    }
  })
})

describe('note validation', () => {
  test('requires text and a boolean visibility flag; preserves plain text', () => {
    expect(parseNote({ content: ' 今天的片段\n第二行 ' })).toEqual({
      content: '今天的片段\n第二行'
    })
    expect(parseNote({ hidden: true }, true)).toEqual({ hidden: true })
    for (const input of [
      null,
      [],
      {},
      { content: ' ' },
      { content: 1 },
      { content: 'a'.repeat(20001) },
      { content: 'ok', hidden: 'false' }
    ]) {
      expect(() => parseNote(input)).toThrow()
    }
    expect(() => parseNote({}, true)).toThrow()
  })
})
