import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(rootDir, 'out')
const { url: siteUrl } = JSON.parse(fs.readFileSync(path.join(rootDir, 'site.config.json'), 'utf8'))
const expectedOrigin = new URL(siteUrl).origin
const errors = []

function collectHtmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectHtmlFiles(entryPath)
    return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : []
  })
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'))?.[1]
}

for (const htmlPath of collectHtmlFiles(outDir)) {
  const html = fs.readFileSync(htmlPath, 'utf8')
  const relativePath = path.relative(rootDir, htmlPath)
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? ''
  const adsenseMeta = (head.match(/<meta\b[^>]*>/gi) ?? []).filter(
    (tag) => attribute(tag, 'name') === 'google-adsense-account'
  )
  if (
    adsenseMeta.length !== 1 ||
    attribute(adsenseMeta[0], 'content') !== 'ca-pub-7441827328189379'
  ) {
    errors.push(`${relativePath}: expected one AdSense verification meta in head`)
  }
  const canonicalTags = (html.match(/<link\b[^>]*>/gi) ?? []).filter((tag) =>
    /\brel=["']canonical["']/i.test(tag)
  )

  if (canonicalTags.length !== 1) {
    errors.push(`${relativePath}: expected exactly one canonical, found ${canonicalTags.length}`)
    continue
  }

  const canonicalHref = attribute(canonicalTags[0], 'href')
  if (!canonicalHref || new URL(canonicalHref).origin !== expectedOrigin) {
    errors.push(`${relativePath}: invalid canonical ${canonicalHref ?? '<missing>'}`)
  }

  for (const metaTag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (attribute(metaTag, 'property') !== 'og:url') continue
    const ogUrl = attribute(metaTag, 'content')
    if (!ogUrl || new URL(ogUrl).origin !== expectedOrigin) {
      errors.push(`${relativePath}: invalid og:url ${ogUrl ?? '<missing>'}`)
    }
  }
}

for (const outputName of [
  'sitemap.xml',
  'feed.xml',
  'robots.txt',
  'llms.txt',
  'llms-full.txt',
  'og-image.png'
]) {
  const outputPath = path.join(outDir, outputName)
  if (!fs.existsSync(outputPath)) {
    errors.push(`out/${outputName}: missing`)
    continue
  }

  if (outputName.endsWith('.txt') || outputName.endsWith('.xml')) {
    const output = fs.readFileSync(outputPath, 'utf8')
    if (/https?:\/\/(?:\d{1,3}\.){3}\d{1,3}/i.test(output)) {
      errors.push(`out/${outputName}: contains an IP-based public URL`)
    }
  }
}

const sitemapFragments = fs
  .readdirSync(outDir)
  .filter((outputName) => /^sitemap-.*\.xml$/.test(outputName))

if (sitemapFragments.length > 0) {
  errors.push(`out/: unexpected sitemap fragments: ${sitemapFragments.join(', ')}`)
}

if (errors.length > 0) {
  console.error(`SEO output verification failed:\n- ${errors.join('\n- ')}`)
  process.exit(1)
}

console.log(`SEO output verified: one ${expectedOrigin} canonical per HTML page.`)
