import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const DEFAULT_ENDPOINT = 'https://api.indexnow.org/indexnow'
const INDEXNOW_KEY = '0fa033ea117044e3a4f36a35f8e87c0f'
const MAX_URLS_PER_REQUEST = 10_000

function decodeXmlText(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replace(/&#(\d+);/g, (_match, codePoint) => String.fromCodePoint(Number(codePoint)))
    .replace(/&#x([\da-f]+);/gi, (_match, codePoint) =>
      String.fromCodePoint(Number.parseInt(codePoint, 16))
    )
}

export function extractSiteUrls(sitemap, site) {
  const siteUrl = new URL(site)
  const basePath = siteUrl.pathname.endsWith('/') ? siteUrl.pathname : `${siteUrl.pathname}/`
  const urls = new Set()

  for (const match of sitemap.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)) {
    try {
      const url = new URL(decodeXmlText(match[1].trim()))
      const belongsToSitePath =
        siteUrl.pathname === '/' ||
        url.pathname === siteUrl.pathname ||
        url.pathname.startsWith(basePath)

      if (url.origin === siteUrl.origin && belongsToSitePath) {
        url.hash = ''
        urls.add(url.href)
      }
    } catch {
      // Malformed sitemap entries are excluded from the IndexNow request.
    }
  }

  return [...urls]
}

export async function submitIndexNowUrls({ urls, site, key, endpoint = DEFAULT_ENDPOINT }) {
  if (urls.length === 0) throw new Error('IndexNow submission has no eligible URLs')
  if (urls.length > MAX_URLS_PER_REQUEST) {
    throw new Error('IndexNow accepts a maximum of 10000 URLs per request')
  }

  const siteUrl = new URL(site)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: siteUrl.hostname,
      key,
      keyLocation: new URL(`/${key}.txt`, siteUrl.origin).href,
      urlList: urls
    })
  })

  if (!response.ok) {
    throw new Error(`IndexNow submission returned HTTP ${response.status}`)
  }

  return urls.length
}

async function main() {
  const siteConfig = JSON.parse(await readFile(path.resolve('site.config.json'), 'utf8'))
  const sitemapUrl = new URL('/sitemap.xml', siteConfig.url)
  const response = await fetch(sitemapUrl)
  if (!response.ok) throw new Error(`Sitemap request returned HTTP ${response.status}`)

  const urls = extractSiteUrls(await response.text(), siteConfig.url)
  const accepted = await submitIndexNowUrls({ urls, site: siteConfig.url, key: INDEXNOW_KEY })
  console.log(`IndexNow accepted ${accepted} URLs.`)
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await main()
}
