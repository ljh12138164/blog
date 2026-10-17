import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const aboutPage = readFileSync(new URL('../out/about.html', import.meta.url), 'utf8')
const homepage = readFileSync(new URL('../out/index.html', import.meta.url), 'utf8')

describe('personal site migration', () => {
  it('exports /about as the personal hub and direct tools with no dependency on the old self site', () => {
    for (const content of [
      '李建辉',
      '中国 · 浙江',
      'sites-section',
      'projects',
      'skills',
      'activity',
      'LJH Tools',
      'Token Paper',
      '今日热点',
      'github.com/DIYgod/RSSHub/pull/23259',
      'github.com/vantezzen/autoform/pull/145',
      'github.com/ant-design/pro-components/pull/9226'
    ]) {
      expect(aboutPage).toContain(content)
    }
    for (const slug of ['json-formatter', 'timestamp-converter', 'base64']) {
      expect(aboutPage).toContain(`href="https://tools.ljhboard.cn/tools/${slug}"`)
    }
    const anchors = aboutPage.match(/<a\b[^>]*>/g) ?? []
    expect(
      anchors.some((anchor) => /href="https?:\/\/(?:self|blog)\.ljhboard\.cn/.test(anchor))
    ).toBe(false)
    expect(aboutPage).toContain('href="/posts/seo-geo-indexnow"')
    expect(aboutPage.match(/<h1\b/g)).toHaveLength(1)
    expect(aboutPage).toContain('href="https://ljhboard.cn/about"')
  })

  it('preserves the blog homepage as the article layout', () => {
    expect(homepage).toContain('这里记录问题，也记录取舍。')
    expect(homepage).not.toContain('id="sites-section"')
    expect(homepage).not.toContain('/profile/avatar.webp')
  })

  it('exports local images and readable skill content before hydration', () => {
    const body = aboutPage.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    for (const name of [
      'avatar.webp',
      'blog.webp',
      'tools.webp',
      'token.webp',
      'news.webp',
      'pro-components.png',
      'autoform.png',
      'snake-light.svg',
      'snake-dark.svg'
    ]) {
      expect(body).toContain(`/profile/${name}`)
      expect(existsSync(new URL(`../out/profile/${name}`, import.meta.url))).toBe(true)
    }
    for (const skill of ['Astro', 'Umi', 'TypeScript', 'Yjs', 'Rspack', 'Hono', 'Resend']) {
      expect(body).toContain(skill)
    }
    for (const theme of ['light', 'dark']) {
      expect(
        readFileSync(new URL(`../out/profile/snake-${theme}.svg`, import.meta.url), 'utf8')
      ).toContain('prefers-reduced-motion')
    }
  })
})
