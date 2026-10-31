import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function linkTags(html, relation) {
  return (html.match(/<link\b[^>]*>/gi) ?? []).filter((tag) =>
    new RegExp(`\\brel=["'][^"']*\\b${relation}\\b[^"']*["']`, 'i').test(tag)
  )
}

function href(tag) {
  return tag.match(/\bhref=["']([^"']+)["']/i)?.[1]
}

describe('resourceHints', () => {
  it('exports only DNS-prefetch hints for deferred third-party scripts', async () => {
    const rootHtmlPath = path.join(rootDir, 'out/index.html')
    const earlyHintsMapPath = path.join(rootDir, '.next/early-hints-map.conf')

    if (!existsSync(rootHtmlPath) || !existsSync(earlyHintsMapPath)) {
      throw new Error(
        'Required build artifacts (out/index.html and .next/early-hints-map.conf) were not found. Run `pnpm build` before running resource-hints tests.'
      )
    }

    const rootHtml = await readFile(rootHtmlPath, 'utf8')
    const earlyHintsMap = await readFile(earlyHintsMapPath, 'utf8')

    expect(linkTags(rootHtml, 'preconnect')).toEqual([])
    expect(linkTags(rootHtml, 'dns-prefetch').map(href).sort()).toEqual([
      'https://static.cloudflareinsights.com'
    ])
    expect(earlyHintsMap).toMatch(/rel=preload; as=style/)
    expect(earlyHintsMap).not.toMatch(/rel=preconnect/)
  })
})
