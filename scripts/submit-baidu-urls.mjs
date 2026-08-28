import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

const DEFAULT_ENDPOINT = 'http://data.zz.baidu.com/urls'

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
  const urls = new Set()

  for (const match of sitemap.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)) {
    try {
      const url = new URL(decodeXmlText(match[1].trim()))
      if (url.origin === siteUrl.origin && url.pathname.startsWith(siteUrl.pathname)) {
        url.hash = ''
        urls.add(url.href)
      }
    } catch {
      // Invalid sitemap entries are excluded instead of being sent to Baidu.
    }
  }

  return [...urls]
}

export async function submitBaiduUrls({ urls, site, token, endpoint = DEFAULT_ENDPOINT }) {
  if (urls.length === 0) throw new Error('Baidu URL submission has no eligible URLs')
  if (!token) throw new Error('BAIDU_PUSH_TOKEN is required')

  const apiUrl = new URL(endpoint)
  apiUrl.searchParams.set('site', site)
  apiUrl.searchParams.set('token', token)

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: urls.join('\n')
  })
  const responseText = await response.text()

  if (!response.ok) {
    throw new Error(`Baidu URL submission returned HTTP ${response.status}`)
  }

  let result
  try {
    result = JSON.parse(responseText)
  } catch {
    throw new Error('Baidu URL submission returned invalid JSON')
  }

  const rejectedCount = (result.not_same_site?.length ?? 0) + (result.not_valid?.length ?? 0)
  if (rejectedCount > 0) {
    throw new Error(`Baidu rejected ${rejectedCount} URL${rejectedCount === 1 ? '' : 's'}`)
  }
  if (result.error) {
    throw new Error(`Baidu URL submission failed with error ${result.error}`)
  }

  return result
}

async function loadSitemap(source) {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source)
    if (!response.ok) throw new Error(`Sitemap request returned HTTP ${response.status}`)
    return response.text()
  }

  return readFile(path.resolve(source), 'utf8')
}

async function main() {
  const token = process.env.BAIDU_PUSH_TOKEN
  if (!token) {
    console.log('Baidu URL submission skipped: BAIDU_PUSH_TOKEN is not configured.')
    return
  }

  const siteConfig = JSON.parse(await readFile(path.resolve('site.config.json'), 'utf8'))
  const site = siteConfig.url
  const sitemapSource = process.env.BAIDU_SITEMAP_SOURCE ?? new URL('/sitemap.xml', site).href
  const urls = extractSiteUrls(await loadSitemap(sitemapSource), site)
  const result = await submitBaiduUrls({ urls, site, token })

  console.log(
    `Baidu accepted ${result.success ?? 0} URLs; remaining daily quota: ${result.remain ?? 'unknown'}.`
  )
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await main()
}
