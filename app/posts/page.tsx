import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, groupPostsByYear } from '@/lib/post-index'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: '文章索引',
  description: `浏览 ${site.name} 的全部技术文章，按发布时间查找前端架构、实时协同、Web 性能、边缘计算与 AI 工程实践。`,
  alternates: { canonical: '/posts' },
  openGraph: {
    type: 'website',
    title: '文章索引',
    description: `浏览 ${site.name} 的全部技术文章。`,
    url: '/posts'
  },
  twitter: {
    card: 'summary',
    title: '文章索引',
    description: `浏览 ${site.name} 的全部技术文章。`
  }
}

export default async function PostsPage() {
  const posts = await getAllPosts()
  const postsByYear = groupPostsByYear(posts)
  const years = [...postsByYear.keys()]

  return (
    <div className="mx-auto mb-24 w-[min(1120px,calc(100%_-_40px))] max-md:w-[min(680px,calc(100%_-_28px))]">
      <header className="grid grid-cols-[minmax(0,1fr)_240px] gap-16 border-b border-ink py-20 max-md:grid-cols-1 max-md:gap-10 max-md:py-14">
        <div>
          <p className="m-0 text-xs font-extrabold text-accent">WRITING INDEX</p>
          <h1 className="mt-5 mb-6 text-balance font-serif text-[clamp(48px,7vw,80px)] leading-none font-medium">
            文章索引
          </h1>
          <p className="m-0 max-w-[640px] text-pretty text-lg leading-[1.8] text-muted">
            从一次问题的定位，到一套方案的形成。这里收录前端架构、实时协同、性能优化、边缘计算与 AI
            工程实践。
          </p>
        </div>

        <aside className="self-end border-t border-line pt-5" aria-label="索引概览">
          <p className="m-0 font-serif text-3xl font-medium tabular-nums">{posts.length}</p>
          <p className="mt-1 mb-5 text-sm text-muted">篇技术文章</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="按年份跳转">
            {years.map((year) => (
              <a
                className="inline-flex min-h-11 items-center text-muted no-underline hover:text-accent"
                href={`#year-${year}`}
                key={year}
              >
                {year}
              </a>
            ))}
          </nav>
        </aside>
      </header>

      {posts.length === 0 ? (
        <section className="py-20 text-center">
          <h2 className="text-balance font-serif text-3xl font-medium">暂时还没有文章</h2>
          <p className="text-pretty text-muted">先回到首页看看博客正在关注的方向。</p>
          <Link
            className="inline-flex min-h-11 items-center border-b border-ink font-bold no-underline"
            href="/"
          >
            返回首页 →
          </Link>
        </section>
      ) : (
        <div className="py-12 max-md:py-8">
          {[...postsByYear].map(([year, yearPosts]) => (
            <section
              className="grid scroll-mt-28 grid-cols-[112px_minmax(0,1fr)] gap-10 py-8 max-md:grid-cols-1 max-md:gap-4 max-md:py-7"
              id={`year-${year}`}
              key={year}
            >
              <header className="self-start max-md:flex max-md:items-baseline max-md:justify-between max-md:border-b max-md:border-ink max-md:pb-4">
                <h2 className="m-0 font-serif text-[32px] font-medium text-accent tabular-nums">
                  {year}
                </h2>
                <p className="mt-2 mb-0 text-xs text-muted tabular-nums">{yearPosts.length} 篇</p>
              </header>

              <ol className="m-0 list-none border-l border-line p-0 max-md:border-l-0">
                {yearPosts.map((post) => (
                  <li
                    className="relative border-t border-line py-8 pl-10 first:border-t-ink max-md:py-7 max-md:pl-0"
                    key={post.slug}
                  >
                    <span
                      className="absolute top-[35px] -left-[5px] size-[9px] rounded-full border border-accent bg-paper max-md:hidden"
                      aria-hidden="true"
                    />
                    <article className="grid grid-cols-[112px_minmax(0,1fr)] gap-8 max-sm:grid-cols-1 max-sm:gap-3">
                      <div className="text-xs text-muted tabular-nums">
                        <time dateTime={post.date}>{post.date.slice(5).replace('-', '.')}</time>
                        <p className="mt-2 mb-0 text-pretty leading-5">{post.category}</p>
                      </div>
                      <div className="min-w-0">
                        <h3 className="m-0 text-balance font-serif text-[28px] leading-[1.32] font-medium max-md:text-2xl">
                          <Link
                            className="no-underline transition-colors hover:text-accent"
                            href={`/posts/${post.slug}`}
                          >
                            {post.title}
                          </Link>
                        </h3>
                        <p className="mt-3 mb-4 max-w-[720px] text-pretty text-[15px] leading-[1.75] text-muted">
                          {post.description}
                        </p>
                        <p className="m-0 text-xs text-muted">预计阅读 {post.readingTime}</p>
                      </div>
                    </article>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
