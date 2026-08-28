import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function linkTags(html, relation) {
  return (html.match(/<link\b[^>]*>/gi) ?? []).filter((tag) =>
    new RegExp(`\\brel=["'][^"']*\\b${relation}\\b[^"']*["']`, 'i').test(tag)
  )
}

function href(tag) {
  return tag.match(/\bhref=["']([^"']+)["']/i)?.[1]
}

test('exports only DNS-prefetch hints for deferred third-party scripts', async () => {
  const rootHtml = await readFile(path.join(rootDir, 'out/index.html'), 'utf8')
  const earlyHintsMap = await readFile(path.join(rootDir, '.next/early-hints-map.conf'), 'utf8')

  assert.deepEqual(linkTags(rootHtml, 'preconnect'), [])
  assert.deepEqual(linkTags(rootHtml, 'dns-prefetch').map(href).sort(), [
    'https://pagead2.googlesyndication.com',
    'https://static.cloudflareinsights.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com'
  ])
  assert.match(earlyHintsMap, /rel=preload; as=style/)
  assert.doesNotMatch(earlyHintsMap, /rel=preconnect/)
})
