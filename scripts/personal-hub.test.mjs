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
    expect(aboutPage).toContain('id="contact"')
    expect(aboutPage).toContain('href="mailto:3479261099@qq.com"')
    for (const removed of [
      '最近写的几篇',
      '我在意的几件事',
      '从这些文章开始',
      '写作原则',
      '修订与纠错',
      '引用、代码与使用边界',
      '为什么写'
    ]) {
      expect(aboutPage).not.toContain(removed)
    }
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
      'contributions-light.svg',
      'contributions-dark.svg'
    ]) {
      expect(body).toContain(`/profile/${name}`)
      expect(existsSync(new URL(`../out/profile/${name}`, import.meta.url))).toBe(true)
    }
    for (const skill of ['Astro', 'Umi', 'TypeScript', 'Yjs', 'Rspack', 'Hono', 'Resend']) {
      expect(body).toContain(skill)
    }
    const skillsSection = body.slice(body.indexOf('id="skills"'), body.indexOf('id="contact"'))
    expect(skillsSection.match(/<svg\b/g)).toHaveLength(43)
  })

  it('shows an ordinary contribution heatmap without snake animation', () => {
    expect(aboutPage).not.toMatch(/snake-|贪吃蛇/)
    for (const theme of ['light', 'dark']) {
      const chart = readFileSync(
        new URL(`../out/profile/contributions-${theme}.svg`, import.meta.url),
        'utf8'
      )
      expect(chart.match(/data-level="[0-4]"/g)).toHaveLength(371)
      expect(chart.match(/data-level="[1-4]"/g)).toHaveLength(178)
      expect(chart).not.toMatch(/animation|@keyframes|<animate|Platane|class="s /)
    }
  })
})
