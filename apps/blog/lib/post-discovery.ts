import type { PostSummary } from './post-index'

export const series = [
  {
    slug: 'collaboration',
    title: '多人实时协同：从冲突到落地',
    description: '先理解冲突如何解决，再把编辑器、同步服务与协同笔记串起来。',
    posts: [
      'conflict-resolution-algorithm',
      'tiptap-collaboration',
      'note-collaboration-system',
      'collaborative-note-optimization'
    ]
  },
  {
    slug: 'cloudflare',
    title: 'Cloudflare：从加速到边缘服务',
    description: '沿着一次请求的路径，实践 CDN、优选 IP、Early Hints 与边缘函数。',
    posts: [
      'cloudflare-cdn-acceleration',
      'cloudflare-custom-hostname-fast-ip',
      'cloudflare-http3-early-hints',
      'edge-function-backend-deployment',
      'websocket-edge-functions',
      'cloudflare-turnstile'
    ]
  },
  {
    slug: 'ai-engineering',
    title: 'AI 工程：从上下文到 Agent',
    description: '从 Token 和提示词出发，尝试模型调用、本地部署，再进入工具执行循环。',
    posts: [
      'token-and-context',
      'prompting-principles',
      'gemini-api',
      'gemini-image-recognition',
      'deepseek-local-deployment',
      'agent-fundamentals'
    ]
  }
]

export function getPostSeries(slug: string) {
  return series.find((item) => item.posts.includes(slug))
}

export function getSeriesPosts(item: (typeof series)[number], posts: PostSummary[]) {
  return item.posts.map((slug) => {
    const post = posts.find((post) => post.slug === slug)
    if (!post) throw new Error(`Series "${item.slug}" references missing post "${slug}"`)
    return post
  })
}

export function getRelatedPosts(current: PostSummary, posts: PostSummary[]) {
  const relatedSeries = getPostSeries(current.slug)
  const score = (post: PostSummary) =>
    (relatedSeries?.posts.includes(post.slug) ? 2 : 0) +
    (post.category === current.category ? 1 : 0)

  return posts
    .filter((post) => post.slug !== current.slug && score(post) > 0)
    .sort(
      (a, b) => score(b) - score(a) || b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug)
    )
    .slice(0, 3)
}

export function groupPostsByYear(posts: PostSummary[]) {
  return posts.reduce<Map<string, PostSummary[]>>((groups, post) => {
    const year = post.date.slice(0, 4)
    const yearPosts = groups.get(year) ?? []
    yearPosts.push(post)
    groups.set(year, yearPosts)
    return groups
  }, new Map())
}

export function filterPosts(posts: PostSummary[], category: string, resultUrls?: string[]) {
  const matches = resultUrls ? new Set(resultUrls) : null
  return posts.filter(
    (post) =>
      (!category || post.category === category) && (!matches || matches.has(`/posts/${post.slug}`))
  )
}

export function getPostsHref(query: string, category = '') {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (category) params.set('category', category)
  return `/posts${params.size ? `?${params}` : ''}`
}
