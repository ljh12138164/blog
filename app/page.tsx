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
    <>
      <section
        className="mx-auto grid min-h-[500px] w-[min(1120px,calc(100%_-_40px))] grid-cols-[minmax(0,1.05fr)_minmax(320px,.75fr)] items-center gap-20 py-[88px] max-md:min-h-0 max-md:w-[min(680px,calc(100%_-_28px))] max-md:grid-cols-1 max-md:gap-14 max-md:py-16"
        data-pagefind-ignore
      >
        <div>
          <span className="text-xs font-extrabold text-accent">THINK · BUILD · REFLECT</span>
          <h1 className="my-6 max-w-[680px] text-balance font-serif text-[clamp(48px,6vw,76px)] leading-[1.06] font-medium max-md:text-[clamp(40px,12vw,56px)]">
            ljh的技术博客
          </h1>
          <p className="mb-9 max-w-[590px] text-pretty text-lg leading-[1.85] text-muted">
            记录技术选型思考、团队协作演进，以及值得反复推敲的硬核工程问题。
          </p>
          <a
            className="inline-flex min-h-11 items-center gap-10 border-b border-ink text-sm font-bold no-underline"
            href="#articles"
          >
            从这里开始 <span aria-hidden="true">↓</span>
          </a>
        </div>

        <article className="border-y border-ink py-7">
          <div className="mb-5 flex items-center justify-between gap-5 text-xs font-bold tracking-[.08em] text-accent uppercase">
            <span>Latest writing</span>
            <time className="text-muted tabular-nums" dateTime={featuredPost.date}>
              {featuredPost.date}
            </time>
          </div>
          <h2 className="my-0 text-balance font-serif text-[34px] leading-[1.25] font-medium max-md:text-[30px]">
            <Link className="no-underline hover:text-accent" href={`/posts/${featuredPost.slug}`}>
              {featuredPost.title}
            </Link>
          </h2>
          <p className="my-5 text-pretty leading-[1.75] text-muted">{featuredPost.description}</p>
          <div className="flex items-center justify-between gap-5 text-xs text-muted">
            <span>
              {featuredPost.category} · {featuredPost.readingTime}
            </span>
            <Link
              className="inline-flex min-h-11 items-center font-bold text-ink no-underline hover:text-accent"
              href={`/posts/${featuredPost.slug}`}
            >
              阅读文章 <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </article>
      </section>

      <section
        className="mx-auto w-[min(1120px,calc(100%_-_40px))] border-t border-ink py-20 max-md:w-[min(680px,calc(100%_-_28px))] max-md:py-16"
        id="articles"
      >
        <div className="mb-11 flex items-end justify-between gap-6 max-md:flex-col max-md:items-start max-md:gap-3">
          <div>
            <span className="text-xs font-extrabold text-accent">START HERE</span>
            <h2 className="mt-2 mb-0 text-balance font-serif text-[42px] font-medium max-md:text-4xl">
              从这里开始
            </h2>
          </div>
          <p className="m-0 max-w-[360px] text-pretty text-sm leading-6 text-muted">
            三篇关于 AI 工程、模型基础与实践方法的入门文章
          </p>
        </div>
        <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1 max-md:gap-0">
          {starterPosts.map((post, index) => (
            <article
              className="flex min-w-0 flex-col border-t border-line py-7 max-md:last:border-b"
              key={post.slug}
            >
              <div className="mb-7 flex items-center justify-between gap-4 text-xs text-muted">
                <span className="font-serif text-accent italic tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <time className="tabular-nums" dateTime={post.date}>
                  {post.date}
                </time>
              </div>
              <p className="mb-3 text-xs text-muted uppercase">
                {post.category} · {post.readingTime}
              </p>
              <h3 className="mt-0 mb-3 text-balance font-serif text-2xl leading-[1.35] font-medium">
                <Link className="no-underline hover:text-accent" href={`/posts/${post.slug}`}>
                  {post.title}
                </Link>
              </h3>
              <p className="m-0 text-pretty text-[15px] leading-[1.75] text-muted">
                {post.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-[min(1120px,calc(100%_-_40px))] border-t border-ink py-16 max-md:w-[min(680px,calc(100%_-_28px))] max-md:py-14">
        <div className="mb-8 flex items-end justify-between gap-6 max-md:flex-col max-md:items-start max-md:gap-3">
          <div>
            <span className="text-xs font-extrabold text-accent">ARCHIVE</span>
            <h2 className="mt-2 mb-0 text-balance font-serif text-[34px] font-medium max-md:text-[32px]">
              全站专题归档
            </h2>
          </div>
          <p className="m-0 text-[13px] text-muted">
            {archivePostCount} 篇技术博文，按领域体系归档
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-16 max-md:grid-cols-1">
          {archiveGroups.map((group) => (
            <section className="border-t border-line py-6" key={group.title}>
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h3 className="m-0 text-balance font-serif text-xl font-medium">{group.title}</h3>
                <span className="text-xs text-muted tabular-nums">{group.posts.length}</span>
              </div>
              <ul className="m-0 list-none space-y-2.5 p-0 text-[15px]">
                {group.posts.map((post) => (
                  <li key={post.href}>
                    <Link
                      className="text-pretty text-muted no-underline hover:text-accent"
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

      <section className="mx-auto mb-[100px] flex w-[min(1120px,calc(100%_-_40px))] items-center justify-between gap-8 border-y border-line py-8 max-md:w-[min(680px,calc(100%_-_28px))] max-md:flex-col max-md:items-start">
        <div>
          <h2 className="m-0 text-balance font-serif text-2xl font-medium">关于博客与作者</h2>
          <p className="mt-1 text-sm text-muted">了解本站的技术理念、个人项目与联系方式</p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center border-b border-ink text-sm font-bold no-underline"
          href="/about"
        >
          关于与联系方式 →
        </Link>
      </section>
    </>
  )
}
