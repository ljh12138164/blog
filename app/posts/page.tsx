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
    locale: 'zh_CN',
    title: `文章索引 · ${site.name}`,
    description: `浏览 ${site.name} 的全部技术文章。`,
    url: '/posts',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `文章索引 · ${site.name}`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `文章索引 · ${site.name}`,
    description: `浏览 ${site.name} 的全部技术文章。`,
    images: ['/og-image.png']
  }
}

export default async function PostsPage() {
  const posts = await getAllPosts()
  const postsByYear = groupPostsByYear(posts)
  const years = [...postsByYear.keys()]

  return (
    <div className="mx-auto mb-24 w-[min(720px,calc(100%_-_40px))] max-md:w-[calc(100%_-_28px)]">
      <header className="border-b border-line py-16 max-md:py-12">
        <p className="m-0 font-mono text-[11px] font-bold text-accent">WRITING INDEX</p>
        <h1 className="mt-4 mb-5 text-balance text-6xl leading-[1.12] font-extrabold max-md:text-[42px]">
          文章索引
        </h1>
        <p className="m-0 max-w-[650px] text-pretty text-base leading-8 text-muted">
          从一次问题的定位，到一套方案的形成。这里收录前端架构、实时协同、性能优化、边缘计算与 AI
          工程实践。
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <p className="m-0 font-mono text-xs text-muted">
            <strong className="text-ink tabular-nums">{posts.length}</strong> 篇技术手记
          </p>
          <nav className="flex flex-wrap gap-1" aria-label="按年份跳转">
            {years.map((year) => (
              <a
                className="inline-flex min-h-11 items-center px-2 font-mono text-xs text-muted no-underline hover:text-accent tabular-nums"
                href={`#year-${year}`}
                key={year}
              >
                {year}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {posts.length === 0 ? (
        <section className="py-20">
          <h2 className="text-balance text-2xl font-bold">暂时还没有文章</h2>
          <p className="text-pretty text-muted">先回到首页看看博客正在关注的方向。</p>
          <Link
            className="inline-flex min-h-11 items-center font-bold text-accent no-underline"
            href="/"
          >
            返回首页 →
          </Link>
        </section>
      ) : (
        <div className="py-8">
          {[...postsByYear].map(([year, yearPosts]) => (
            <section className="scroll-mt-24 py-7" id={`year-${year}`} key={year}>
              <header className="mb-2 flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <h2 className="m-0 font-mono text-xl font-bold text-accent tabular-nums">{year}</h2>
                <p className="m-0 font-mono text-[11px] text-muted tabular-nums">
                  {yearPosts.length} NOTES
                </p>
              </header>

              <ol className="m-0 list-none p-0">
                {yearPosts.map((post) => (
                  <li className="border-b border-line py-6" key={post.slug}>
                    <article className="grid grid-cols-[92px_minmax(0,1fr)] gap-5 max-sm:grid-cols-1 max-sm:gap-2">
                      <div className="font-mono text-[11px] leading-5 text-muted tabular-nums">
                        <time dateTime={post.date}>{post.date.slice(5).replace('-', '.')}</time>
                        <p className="m-0 text-pretty">{post.category}</p>
                      </div>
                      <div className="min-w-0">
                        <h3 className="m-0 text-balance text-xl leading-[1.45] font-bold">
                          <Link
                            className="inline-flex min-h-11 items-center no-underline hover:text-accent"
                            href={`/posts/${post.slug}`}
                          >
                            {post.title}
                          </Link>
                        </h3>
                        <p className="mt-2 mb-3 max-w-[620px] text-pretty text-sm leading-6 text-muted">
                          {post.description}
                        </p>
                        <p className="m-0 font-mono text-[10px] text-muted uppercase tabular-nums">
                          READ {post.readingTime}
                        </p>
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
