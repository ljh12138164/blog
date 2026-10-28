import Link from 'next/link'
import { getPostSeries, getRelatedPosts, getSeriesPosts } from '@/lib/post-discovery'
import { getAllPosts } from '@/lib/post-index'

export async function ArticleDiscovery({ slug }: { slug: string }) {
  const posts = await getAllPosts()
  const current = posts.find((post) => post.slug === slug)
  if (!current) return null
  const item = getPostSeries(slug)
  const chapters = item ? getSeriesPosts(item, posts) : []
  const index = chapters.findIndex((post) => post.slug === slug)
  const previous = chapters[index - 1]
  const next = chapters[index + 1]
  const related = getRelatedPosts(current, posts)

  return (
    <div className="mt-12" data-pagefind-ignore>
      {item && (
        <section className="border-t border-line py-6" aria-labelledby="article-series-title">
          <p className="m-0 font-mono text-xs text-muted tabular-nums">
            所属专栏 · 第 {index + 1} / {chapters.length} 篇
          </p>
          <h2 className="mt-2 mb-4 text-balance text-xl font-bold" id="article-series-title">
            <Link
              className="inline-flex min-h-11 items-center hover:text-accent"
              href={`/series/${item.slug}`}
            >
              {item.title}
            </Link>
          </h2>
          <nav
            className="grid grid-cols-2 gap-6 max-sm:grid-cols-1"
            aria-label="专栏上一篇与下一篇"
          >
            {[
              { post: previous, label: '上一篇' },
              { post: next, label: '下一篇' }
            ].map(
              ({ post, label }) =>
                post && (
                  <Link
                    key={label}
                    className="flex min-h-11 min-w-0 flex-col gap-2 text-sm hover:text-accent"
                    href={`/posts/${post.slug}`}
                  >
                    <span className="text-xs text-muted">{label}</span>
                    <span className="text-pretty font-semibold">{post.title}</span>
                  </Link>
                )
            )}
          </nav>
        </section>
      )}
      {related.length > 0 && (
        <section className="border-t border-line py-6" aria-labelledby="related-posts-title">
          <h2 className="mt-0 mb-3 text-balance text-xl font-bold" id="related-posts-title">
            继续阅读
          </h2>
          <ul className="m-0 list-none p-0">
            {related.map((post) => (
              <li className="border-b border-line py-3" key={post.slug}>
                <Link
                  className="inline-flex min-h-11 items-center text-pretty text-sm hover:text-accent"
                  href={`/posts/${post.slug}`}
                >
                  {post.title}
                </Link>
                <p className="m-0 font-mono text-[11px] text-muted">
                  {post.category} · {post.readingTime}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
