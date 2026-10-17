import fs from 'node:fs'
import vm from 'node:vm'
import { expect, it } from 'vitest'

it('sets denied consent synchronously before Google scripts in exported pages', () => {
  const pages = fs.readdirSync('out', { recursive: true }).filter((file) => file.endsWith('.html'))
  expect(pages.length).toBeGreaterThan(0)

  for (const page of pages) {
    const html = fs.readFileSync(`out/${page}`, 'utf8')
    const consent = html.match(
      /<script\b[^>]*id="google-consent-default"[^>]*>([\s\S]*?)<\/script>/
    )
    expect(consent, page).not.toBeNull()
    const adTag = html.match(/<script\b[^>]*src="https:\/\/pagead2\.googlesyndication\.com[^>]*>/)
    expect(adTag, page).not.toBeNull()
    expect(html.indexOf(consent[0]), page).toBeLessThan(html.indexOf(adTag[0]))
    expect(consent[0].slice(0, consent[0].indexOf('>')), page).not.toMatch(
      /\s(?:async|defer)(?:[\s=>])|\ssrc=/
    )
    expect(html.indexOf(consent[0]), page).toBeLessThan(html.indexOf('</head>'))

    const context = { dataLayer: [] }
    context.window = context
    vm.runInNewContext(consent[1], context)
    const [command, action, state] = Array.from(context.dataLayer[0])
    expect([command, action], page).toEqual(['consent', 'default'])
    for (const type of ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization']) {
      expect(state[type], `${page}: ${type}`).toBe('denied')
    }
    expect(state.wait_for_update, page).toBeGreaterThan(0)
    expect(context.dataLayer, page).toHaveLength(1)
  }
})

it('allows page CSS and JS to be crawled while retaining the root sitemap', () => {
  const robots = fs.readFileSync('out/robots.txt', 'utf8')
  expect(robots).not.toMatch(/^Disallow:\s*\/_next/m)
  expect(robots).toContain('Disallow: /_pagefind/')
  expect(robots).toContain('Sitemap: https://ljhboard.cn/sitemap.xml')
})
