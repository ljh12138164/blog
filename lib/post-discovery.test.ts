import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  filterPosts,
  getPostSeries,
  getPostsHref,
  getRelatedPosts,
  getSeriesPosts,
  series
} from './post-discovery'
import type { PostSummary } from './post-index'

function post(slug: string, category = '协同架构', date = '2026-01-01'): PostSummary {
  return { slug, category, date, title: slug, description: slug, readingTime: '5 分钟' }
}

describe('article discovery', () => {
  it('keeps every curated series unique and references real MDX articles', () => {
    const slugs = series.flatMap((item) => item.posts)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs)
      expect(fs.existsSync(path.join('app', 'posts', slug, 'page.mdx'))).toBe(true)
  })

  it('uses editorial chapter order, with no predecessor or successor at the boundaries', () => {
    const item = series[0]
    const posts = [...item.posts].reverse().map((slug) => post(slug))
    const chapters = getSeriesPosts(item, posts)
    expect(chapters.map((post) => post.slug)).toEqual(item.posts)
    expect(chapters[-1]).toBeUndefined()
    expect(chapters[chapters.length]).toBeUndefined()
    expect(getPostSeries(item.posts[0])).toEqual(item)
    expect(() => getSeriesPosts(item, [])).toThrow('missing post')
  })

  it('prefers the same series over newer same-category articles and excludes self and unrelated content', () => {
    const current = post('tiptap-collaboration')
    const related = getRelatedPosts(current, [
      current,
      post('newer-same-category', '协同架构', '2026-10-01'),
      post('conflict-resolution-algorithm', '另一分类', '2025-01-01'),
      post('unrelated', 'AI 工程', '2026-10-02')
    ])
    expect(related.map((post) => post.slug)).toEqual([
      'conflict-resolution-algorithm',
      'newer-same-category'
    ])
    expect(getRelatedPosts(post('isolated', '独立分类'), [current])).toEqual([])
  })

  it('intersects full-text result URLs and exact categories, including empty and unknown filters', () => {
    const posts = [post('a'), post('b', 'AI 工程')]
    expect(filterPosts(posts, '')).toEqual(posts)
    expect(
      filterPosts(posts, 'AI 工程', ['/posts/a', '/posts/b']).map((post) => post.slug)
    ).toEqual(['b'])
    expect(filterPosts(posts, '', [])).toEqual([])
    expect(filterPosts(posts, '不存在')).toEqual([])
  })

  it('round-trips Chinese keywords and reserved characters in shareable links', () => {
    const url = new URL(getPostsHref('  Token & Context?  ', 'AI 工程'), 'https://example.com')
    expect(url.searchParams.get('q')).toBe('Token & Context?')
    expect(url.searchParams.get('category')).toBe('AI 工程')
    expect(getPostsHref('   ')).toBe('/posts')
  })
})
