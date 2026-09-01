import type { Metadata } from 'next'
import Link from 'next/link'
import { archiveGroups, archivePostCount, recentPosts } from '@/lib/posts'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  keywords: [
    '前端架构',
    'Web 性能优化',
    '实时协同',
    'CRDT',
    'OT',
    '全栈开发',
    '边缘计算',
    'Cloudflare',
    'AI 大模型',
    'LLM',
    'AI Agent',
    '技术博客'
  ],
  alternates: { canonical: '/' }
}

const [featuredPost, ...starterPosts] = recentPosts

export default function HomePage() {
  return (
    <div className="mx-auto w-[min(720px,calc(100%_-_40px))] max-md:w-[calc(100%_-_28px)]">
      <header className="py-20 max-md:py-14" data-pagefind-ignore>
        <span className="inline-flex rounded-sm bg-accent-soft px-2 py-1 font-mono text-[11px] font-bold text-accent">
          FRONTEND FIELD NOTES
        </span>
        <h1 className="mt-6 mb-5 max-w-[680px] text-balance text-6xl leading-[1.12] font-extrabold max-md:text-[42px]">
          你好，我是 ljh。
          <br />
          这里记录问题，也记录取舍。
        </h1>
        <p className="m-0 max-w-[650px] text-pretty text-[17px] leading-8 text-muted">
          一名前端工程师的个人技术手账。写协同编辑、性能优化、边缘计算与 AI
          工程，也保留那些最后没有采用的方案。
        </p>
        <aside className="mt-7 border-l-2 border-accent pl-4" aria-label="现场注记">
          <p className="m-0 font-mono text-[11px] font-bold text-accent">NOTE / 001</p>
          <p className="mt-2 mb-0 text-pretty text-sm leading-6 text-muted">
            先把问题发生时的上下文写清楚，再讨论所谓的最佳实践。
          </p>
        </aside>
      </header>

      <main>
        <section className="border-t border-line py-10" data-pagefind-ignore>
          <div className="mb-5 flex items-center justify-between gap-4 font-mono text-[11px] text-muted">
            <span className="font-bold text-accent">LATEST NOTE</span>
            <time className="tabular-nums" dateTime={featuredPost.date}>
              {featuredPost.date}
            </time>
          </div>
          <h2 className="m-0 text-balance text-4xl leading-[1.3] font-bold max-md:text-[28px]">
            <Link
              className="inline-flex min-h-11 items-center no-underline hover:text-accent"
              href={`/posts/${featuredPost.slug}`}
            >
              {featuredPost.title}
            </Link>
          </h2>
          <p className="mt-4 mb-0 text-pretty leading-7 text-muted">{featuredPost.description}</p>
          <div className="mt-5 flex items-center justify-between gap-5 text-xs text-muted">
            <span className="font-mono tabular-nums">
              {featuredPost.category} · {featuredPost.readingTime}
            </span>
            <Link
              className="inline-flex min-h-11 items-center font-bold text-accent no-underline"
              href={`/posts/${featuredPost.slug}`}
            >
              打开手记 <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        <section className="border-t border-line py-10" id="articles">
          <div className="mb-2 flex items-end justify-between gap-5 max-sm:items-start">
            <div>
              <span className="font-mono text-[11px] font-bold text-accent">PINNED NOTES</span>
              <h2 className="mt-2 mb-0 text-balance text-2xl font-bold">最近反复翻看的三页</h2>
            </div>
            <span className="shrink-0 font-mono text-[11px] text-muted tabular-nums">
              03 / {archivePostCount}
            </span>
          </div>
          <div>
            {starterPosts.map((post) => (
              <article
                className="grid grid-cols-[92px_minmax(0,1fr)] gap-5 border-b border-line py-6 max-sm:grid-cols-1 max-sm:gap-2"
                key={post.slug}
              >
                <div className="font-mono text-[11px] leading-5 text-muted tabular-nums">
                  <time className="tabular-nums" dateTime={post.date}>
                    {post.date}
                  </time>
                  <p className="m-0">{post.readingTime}</p>
                </div>
                <div className="min-w-0">
                  <p className="m-0 font-mono text-[10px] font-bold text-accent uppercase">
                    {post.category}
                  </p>
                  <h3 className="mt-2 mb-2 text-balance text-xl leading-[1.45] font-bold">
                    <Link
                      className="inline-flex min-h-11 items-center no-underline hover:text-accent"
                      href={`/posts/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="m-0 text-pretty text-sm leading-6 text-muted">{post.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-line py-10">
          <div className="mb-5 flex items-end justify-between gap-5">
            <div>
              <span className="font-mono text-[11px] font-bold text-accent">TOPIC INDEX</span>
              <h2 className="mt-2 mb-0 text-balance text-2xl font-bold">按问题领域归档</h2>
            </div>
            <Link
              className="inline-flex min-h-11 shrink-0 items-center text-xs text-accent no-underline"
              href="/posts"
            >
              全部文章 →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-8 max-sm:grid-cols-1">
            {archiveGroups.map((group) => (
              <section className="border-t border-line py-5" key={group.title}>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h3 className="m-0 text-base font-bold">{group.title}</h3>
                  <span className="font-mono text-[11px] text-muted tabular-nums">
                    {group.posts.length}
                  </span>
                </div>
                <ul className="m-0 list-none space-y-2 p-0 text-sm">
                  {group.posts.map((post) => (
                    <li key={post.href}>
                      <Link
                        className="inline-flex min-h-11 items-center text-pretty text-muted no-underline hover:text-accent"
                        href={post.href}
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <section className="mb-20 flex items-center justify-between gap-7 border-y border-line py-7 max-sm:flex-col max-sm:items-start">
          <div>
            <h2 className="m-0 text-balance text-xl font-bold">关于这本手账</h2>
            <p className="mt-2 mb-0 text-pretty text-sm leading-6 text-muted">
              技术理念、个人项目，以及可以找到我的地方。
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center text-sm font-bold text-accent no-underline"
            href="/about"
          >
            关于与联系方式 →
          </Link>
        </section>
      </main>
    </div>
  )
}
