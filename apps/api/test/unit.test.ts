import 'reflect-metadata'
import { beforeAll, describe, expect, test } from 'bun:test'
import { AuthService } from '../src/auth'
import { readConfig } from '../src/config'
import { parseNote } from '../src/notes'

const env = {
  DATABASE_URL: 'postgres://test@localhost/blog_test',
  JOURNAL_PASSWORD_HASH: '$argon2id$test-only',
  SESSION_SECRET: 'test-session-secret-with-at-least-32-characters'
}

describe('configuration', () => {
  test('rejects missing database, password hash, invalid port and insecure production cookies', () => {
    expect(() => readConfig({})).toThrow('DATABASE_URL')
    expect(() => readConfig({ ...env, JOURNAL_PASSWORD_HASH: 'plaintext' })).toThrow(
      'JOURNAL_PASSWORD_HASH'
    )
    expect(() => readConfig({ ...env, PORT: '0' })).toThrow('PORT')
    expect(() => readConfig({ ...env, SESSION_SECRET: 'short' })).toThrow('SESSION_SECRET')
    expect(() => readConfig({ ...env, NODE_ENV: 'production' })).toThrow('HTTPS')
    expect(readConfig({ ...env, NODE_ENV: 'production', COOKIE_SECURE: 'true' }).secureCookie).toBe(
      true
    )
  })
})

describe('owner authentication', () => {
  let auth: AuthService
  beforeAll(async () => {
    auth = new AuthService(
      readConfig({ ...env, JOURNAL_PASSWORD_HASH: await Bun.password.hash('test-password-only') })
    )
  })
  test('checks the password without accepting missing or non-string values', async () => {
    expect(await auth.checkPassword('test-password-only')).toBe(true)
    expect(await auth.checkPassword('wrong')).toBe(false)
    expect(await auth.checkPassword(undefined)).toBe(false)
    expect(await auth.checkPassword({})).toBe(false)
  })
  test('rejects tampered, expired, malformed and rotated-secret sessions', () => {
    const now = 1000000
    const session = auth.createSession(now)
    expect(auth.isValid(session, now)).toBe(true)
    expect(auth.isValid(`${session}a`, now)).toBe(false)
    expect(auth.isValid(session, now + 7 * 24 * 60 * 60 * 1000)).toBe(false)
    expect(auth.isValid('garbage', now)).toBe(false)
    const rotated = new AuthService(
      readConfig({ ...env, SESSION_SECRET: 'a-different-secret-with-at-least-32-characters' })
    )
    expect(rotated.isValid(session, now)).toBe(false)
    expect(auth.cookie(session)).toContain('HttpOnly')
    expect(auth.cookie(session)).toContain('SameSite=Strict')
    expect(auth.cookie(session)).not.toContain('Secure;')
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
