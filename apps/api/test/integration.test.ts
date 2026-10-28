import { afterAll, beforeAll, expect, test } from 'bun:test'
import { randomBytes, randomUUID } from 'node:crypto'
import type { INestApplication } from '@nestjs/common'
import { createApp } from '../src/app'
import { AuthService } from '../src/auth'
import { type ApiConfig, readConfig } from '../src/config'
import { DatabaseService } from '../src/database/database.service'
import { migrateDatabase } from '../src/database/migrate'
import { notes } from '../src/database/schema'

const databaseUrl = process.env.TEST_DATABASE_URL
if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must point to a dedicated database whose name ends with _test')
}
const password = randomBytes(24).toString('hex')
let app: INestApplication
let base: string
let config: ApiConfig
let cookie = ''
const created: string[] = []

async function start() {
  app = await createApp(config)
  await app.listen(0, '127.0.0.1')
  base = await app.getUrl()
}

async function request(path: string, method = 'GET', body?: unknown, owner = false, csrf = true) {
  return fetch(`${base}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(csrf ? { 'X-Journal-Request': '1' } : {}),
      ...(owner ? { Cookie: cookie } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
}

beforeAll(async () => {
  config = readConfig({
    DATABASE_URL: databaseUrl,
    JOURNAL_PASSWORD_HASH: await Bun.password.hash(password),
    SESSION_SECRET: randomBytes(32).toString('hex')
  })
  await migrateDatabase(databaseUrl)
  await migrateDatabase(databaseUrl)
  await start()
})

afterAll(async () => {
  cookie = `journal_session=${new AuthService(config).createSession()}`
  if (cookie)
    for (const id of created) await request(`/admin/notes/${id}`, 'DELETE', undefined, true)
  await app?.close()
})

test('password-protected HTTP lifecycle persists public/hidden notes and rejects unauthorized writes', async () => {
  expect((await request('/readyz')).status).toBe(200)
  expect((await request('/admin/notes')).status).toBe(401)
  expect((await request('/admin/notes', 'POST', { content: 'blocked' })).status).toBe(401)
  expect((await request('/auth/login', 'POST', { password }, false, false)).status).toBe(403)
  expect((await request('/auth/login', 'POST', { password: 'wrong' })).status).toBe(401)
  const login = await request('/auth/login', 'POST', { password })
  expect(login.status).toBe(200)
  expect(login.headers.get('set-cookie')).toContain('HttpOnly')
  cookie = login.headers.get('set-cookie')?.split(';')[0] ?? ''
  expect((await request('/auth/session', 'GET', undefined, true)).status).toBe(200)

  expect((await request('/admin/notes', 'POST', { content: ' ' }, true)).status).toBe(400)
  const response = await request(
    '/admin/notes',
    'POST',
    { content: '今天记录：中文与换行\n<script>保持纯文本</script>' },
    true
  )
  expect(response.status).toBe(201)
  const note = await response.json()
  created.push(note.id)
  expect(note.hidden).toBe(false)
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(
    (await (await request('/notes')).json()).notes.some(
      (item: { id: string }) => item.id === note.id
    )
  ).toBe(true)

  expect((await request(`/admin/notes/${note.id}`, 'PATCH', { hidden: true })).status).toBe(401)
  expect(
    (await request(`/admin/notes/${note.id}`, 'PATCH', { hidden: true }, true, false)).status
  ).toBe(403)
  const hidden = await request(`/admin/notes/${note.id}`, 'PATCH', { hidden: true }, true)
  expect(hidden.status).toBe(200)
  expect(
    (await (await request('/notes')).json()).notes.some(
      (item: { id: string }) => item.id === note.id
    )
  ).toBe(false)
  expect(
    (await (await request('/admin/notes', 'GET', undefined, true)).json()).notes.some(
      (item: { id: string; hidden: boolean }) => item.id === note.id && item.hidden
    )
  ).toBe(true)
  expect((await request(`/notes/${note.id}`)).status).toBe(404)

  await app.close()
  await start()
  const persisted = (
    await (await request('/admin/notes', 'GET', undefined, true)).json()
  ).notes.find((item: { id: string }) => item.id === note.id)
  expect(persisted.content).toBe(note.content)
  const restored = await request(
    `/admin/notes/${note.id}`,
    'PATCH',
    { content: '修订后的片段', hidden: false },
    true
  )
  expect((await restored.json()).content).toBe('修订后的片段')
  expect(
    (await (await request('/notes')).json()).notes.some(
      (item: { id: string }) => item.id === note.id
    )
  ).toBe(true)
  expect((await request('/notes?offset=-1')).status).toBe(400)
  expect((await request('/admin/notes/not-a-uuid', 'DELETE', undefined, true)).status).toBe(400)
  expect((await request(`/admin/notes/${randomUUID()}`, 'DELETE', undefined, true)).status).toBe(
    404
  )
  expect((await request(`/admin/notes/${note.id}`, 'DELETE', undefined, true)).status).toBe(204)
  expect(
    (await (await request('/notes')).json()).notes.some(
      (item: { id: string }) => item.id === note.id
    )
  ).toBe(false)

  const logout = await request('/auth/logout', 'POST', undefined, true)
  expect(logout.headers.get('set-cookie')).toContain('Max-Age=0')
  cookie = ''
  expect((await request('/admin/notes', 'GET', undefined, true)).status).toBe(401)
})

test('throttles repeated password attempts', async () => {
  let status = 0
  for (let attempt = 0; attempt < 6; attempt++) {
    status = (await request('/auth/login', 'POST', { password: 'incorrect' })).status
  }
  expect(status).toBe(429)
})

test('paginates public notes without leaking hidden notes on later pages', async () => {
  const fixtures = Array.from({ length: 25 }, (_, index) => ({
    id: randomUUID(),
    content: `分页测试 ${index}`,
    hidden: index < 2,
    createdAt: new Date(Date.now() + index)
  }))
  created.push(...fixtures.map((note) => note.id))
  await app.get(DatabaseService).db.insert(notes).values(fixtures)
  const first = await (await request('/notes')).json()
  const second = await (await request('/notes?offset=20')).json()
  expect(first.notes).toHaveLength(20)
  expect(first.hasMore).toBe(true)
  const ids = [...first.notes, ...second.notes].map((note: { id: string }) => note.id)
  expect(new Set(ids).size).toBe(ids.length)
  for (const fixture of fixtures) expect(ids.includes(fixture.id)).toBe(!fixture.hidden)
})
