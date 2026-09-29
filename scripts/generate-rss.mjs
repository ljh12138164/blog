import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const SITE_URL = JSON.parse(fs.readFileSync(path.join(rootDir, 'site.config.json'), 'utf-8')).url
const SITE_NAME = 'ljh.notes'
const SITE_DESC = 'ljh个人技术手记，持续修订，写给下一次遇到同样问题的自己。'

const postsDir = path.join(rootDir, 'app', 'posts')

export function parseMetadata(content) {
  const metaMatch = content.match(/export\s+const\s+metadata\s*=\s*(\{[\s\S]*?\n\})/)
  if (!metaMatch) return {}

  const metaStr = metaMatch[1]
  const titleMatch = metaStr.match(/title:\s*['"]([^'"]+)['"]/)
  const descMatch = metaStr.match(/description:\s*['"]([^'"]+)['"]/)
  const dateMatch = metaStr.match(/date:\s*['"]([^'"]+)['"]/)
  const catMatch = metaStr.match(/category:\s*['"]([^'"]+)['"]/)

  return {
    title: titleMatch ? titleMatch[1] : '',
    description: descMatch ? descMatch[1] : '',
    date: dateMatch ? dateMatch[1] : '',
    category: catMatch ? catMatch[1] : '其他'
  }
}

export function buildRssXml(
  posts,
  { siteUrl = SITE_URL, siteName = SITE_NAME, siteDesc = SITE_DESC } = {}
) {
  const itemsXml = posts
    .map((post) => {
      const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString()
      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${post.url}</link>
      <guid isPermaLink="true">${post.url}</guid>
      <description><![CDATA[${post.description}]]></description>
      <category>${post.category}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>${siteDesc}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>
`
}

export function generateRss() {
  console.log('📡 正在自动生成 feed.xml...')

  if (!fs.existsSync(postsDir)) {
    console.warn('⚠️ 未找到 app/posts 目录，跳过生成。')
    return
  }

  const entries = fs.readdirSync(postsDir, { withFileTypes: true })
  const posts = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const mdxPath = path.join(postsDir, entry.name, 'page.mdx')
    if (!fs.existsSync(mdxPath)) continue

    const rawContent = fs.readFileSync(mdxPath, 'utf-8')
    const meta = parseMetadata(rawContent)

    if (meta.title) {
      posts.push({
        slug: entry.name,
        url: `${SITE_URL}/posts/${entry.name}`,
        ...meta
      })
    }
  }

  // 按日期倒序排列
  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  const rssXml = buildRssXml(posts)

  const publicDir = path.join(rootDir, 'public')
  const outDir = path.join(rootDir, 'out')

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
  fs.writeFileSync(path.join(publicDir, 'feed.xml'), rssXml, 'utf-8')

  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, 'feed.xml'), rssXml, 'utf-8')
  }

  console.log(`✅ 成功生成 feed.xml（共收录 ${posts.length} 篇技术手记）！`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  generateRss()
}
