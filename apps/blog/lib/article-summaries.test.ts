import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { articleSummaries } from './article-summaries'

describe('article summaries', () => {
  const slugs = fs
    .readdirSync('app/posts')
    .filter((slug) => fs.existsSync(path.join('app', 'posts', slug, 'page.mdx')))

  it('covers every published article without referencing deleted articles', () => {
    expect(Object.keys(articleSummaries).sort()).toEqual(slugs.sort())
  })

  it('keeps summaries concise and distinct from SEO descriptions', () => {
    for (const slug of slugs) {
      const summary = articleSummaries[slug]
      expect(summary, slug).toBeDefined()
      expect(summary.trim(), slug).toBe(summary)
      expect([...summary].length, slug).toBeGreaterThanOrEqual(80)
      expect([...summary].length, slug).toBeLessThanOrEqual(150)
      const source = fs.readFileSync(path.join('app', 'posts', slug, 'page.mdx'), 'utf8')
      const description = source.match(/description:\s*'([^']+)'/)?.[1]
      expect(summary, slug).not.toBe(description)
    }
  })
})
