import fs from 'node:fs'
import vm from 'node:vm'
import { expect, it } from 'vitest'

it('sets denied consent synchronously and defers AdSense execution in exported pages', () => {
  const pages = fs.readdirSync('out', { recursive: true }).filter((file) => file.endsWith('.html'))
  expect(pages.length).toBeGreaterThan(0)

  for (const page of pages) {
    const html = fs.readFileSync(`out/${page}`, 'utf8')
    const consent = html.match(
      /<script\b[^>]*id="google-consent-default"[^>]*>([\s\S]*?)<\/script>/
    )
    expect(consent, page).not.toBeNull()
    // AdSense mutates head; running it before hydration can duplicate consent defaults.
    expect(/<script\b[^>]*src="https:\/\/pagead2\.googlesyndication\.com/.test(html), page).toBe(
      false
    )
    expect(html, page).toContain(
      '<meta name="google-adsense-account" content="ca-pub-7441827328189379"'
    )
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

it('keeps functional pages free of ad units and the AdSense loader', () => {
  for (const page of ['index', 'posts', 'about', 'privacy', 'notes', 'write', '404']) {
    const html = fs.readFileSync(`out/${page}.html`, 'utf8')
    expect(html, page).not.toContain('pagead2.googlesyndication.com')
    expect(html, page).not.toMatch(/<ins[^>]+data-ad-slot=/)
  }
})

it('exports exactly one manual slot per retained article', () => {
  const posts = fs
    .readdirSync('app/posts')
    .filter((slug) => fs.existsSync(`app/posts/${slug}/page.mdx`))
  const config = JSON.parse(fs.readFileSync('site.config.json', 'utf8'))
  for (const slug of posts) {
    const html = fs.readFileSync(`out/posts/${slug}.html`, 'utf8')
    const slots = html.match(/<ins\b[^>]*data-ad-slot="[^"]+"[^>]*>/g) || []
    expect(slots, slug).toHaveLength(config.articleAdSlot ? 1 : 0)
    if (slots.length) expect(slots[0], slug).toContain(`data-ad-slot="${config.articleAdSlot}"`)
  }
})

it('removes deleted articles from routes and public discovery files', () => {
  const removed = ['jebet-optimization', 'design-optimization', 'canvas-library-research']
  for (const slug of removed) {
    expect(fs.existsSync(`out/posts/${slug}.html`), slug).toBe(false)
    expect(fs.existsSync(`app/posts/${slug}`), slug).toBe(false)
    for (const file of [
      'sitemap.xml',
      'feed.xml',
      'llms.txt',
      'llms-full.txt',
      'index.html',
      'posts.html'
    ]) {
      expect(fs.readFileSync(`out/${file}`, 'utf8'), `${file}: ${slug}`).not.toContain(
        `/posts/${slug}`
      )
    }
  }
})
