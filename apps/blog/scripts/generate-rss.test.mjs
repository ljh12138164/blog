import { describe, expect, it } from 'vitest'
import { buildRssXml, parseMetadata } from './generate-rss.mjs'

describe('generate-rss', () => {
  it('parses metadata from mdx export', () => {
    const raw = `
export const metadata = {
  title: '测试文章标题',
  description: '测试文章摘要',
  date: '2026-09-27',
  category: 'AI 工程',
  readingTime: '5 分钟'
}

正文内容...
`
    const meta = parseMetadata(raw)
    expect(meta.title).toBe('测试文章标题')
    expect(meta.description).toBe('测试文章摘要')
    expect(meta.date).toBe('2026-09-27')
    expect(meta.category).toBe('AI 工程')
  })

  it('builds valid RSS 2.0 XML with items', () => {
    const posts = [
      {
        slug: 'test-post',
        title: '测试文章',
        description: '文章描述',
        date: '2026-09-27',
        category: '架构',
        url: 'https://blog.ljhboard.cn/posts/test-post'
      }
    ]

    const xml = buildRssXml(posts, {
      siteUrl: 'https://blog.ljhboard.cn',
      siteName: '测试博客',
      siteDesc: '博客描述'
    })

    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('<title>测试博客</title>')
    expect(xml).toContain('<title><![CDATA[测试文章]]></title>')
    expect(xml).toContain('<link>https://blog.ljhboard.cn/posts/test-post</link>')
    expect(xml).toContain('<category>架构</category>')
  })
})
