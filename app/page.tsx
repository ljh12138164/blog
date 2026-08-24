import type { Metadata } from 'next'
import Link from 'next/link'
import { archiveGroups, archivePostCount, recentPosts } from '@/lib/posts'

export const metadata: Metadata = {
  alternates: { canonical: '/' }
}

export default function HomePage() {
  return (
    <>
      <section className="mx-auto min-h-[620px] w-[min(1120px,calc(100%_-_40px))] py-[120px] pb-[90px] max-md:min-h-0 max-md:w-[min(680px,calc(100%_-_28px))] max-md:py-[90px]" data-pagefind-ignore>
        <span className="text-xs font-extrabold text-accent">THINK · BUILD · REFLECT</span>
        <h1 className="my-[26px] mb-[34px] max-w-[900px] text-balance font-serif text-[clamp(54px,8vw,102px)] leading-[.99] font-medium max-md:text-[clamp(48px,15vw,70px)]">
          ljh的技术博客
        </h1>
        <p className="mb-4 max-w-[650px] text-pretty font-serif text-xl leading-[1.8] text-muted">
          大家好！我是李建辉，一名热爱技术的开发者。这里分享编程技术心得、学习资源整理和项目开发经验。
        </p>
        <p className="mb-[46px] max-w-[650px] text-pretty font-serif text-xl leading-[1.8] text-muted">
          也记录阅读、生活，以及一些尚未想清楚的问题。
        </p>
        <a className="inline-flex min-h-11 items-center gap-[42px] border-b border-ink text-sm font-bold no-underline" href="#articles">
          开始阅读 <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="mx-auto w-[min(1120px,calc(100%_-_40px))] border-t border-ink py-[100px] max-md:w-[min(680px,calc(100%_-_28px))] max-md:py-16" id="articles">
        <div className="mb-11 flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
          <div>
            <span className="text-xs font-extrabold text-accent">RECENT WRITING</span>
            <h2 className="mt-2 mb-0 text-balance font-serif text-5xl font-medium max-md:text-4xl">近期文章</h2>
          </div>
          <p className="text-[13px] text-muted">{recentPosts.length} 篇近期技术与思考</p>
        </div>
        <div>
          {recentPosts.map((post, index) => (
            <article className="grid grid-cols-[64px_1fr_auto] gap-7 border-t border-line py-9 last:border-b max-md:grid-cols-[34px_1fr] max-md:gap-4" key={post.slug}>
              <span className="font-serif text-accent italic tabular-nums">{String(index + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <p className="mb-3 text-xs text-muted uppercase">{post.category} · {post.readingTime}</p>
                <h3 className="mb-3 text-balance font-serif text-[29px] font-medium max-md:text-2xl">
                  <Link className="no-underline hover:text-accent" href={`/posts/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="m-0 max-w-[680px] text-pretty leading-[1.7] text-muted">{post.description}</p>
              </div>
              <time className="font-serif text-[13px] text-muted tabular-nums max-md:hidden" dateTime={post.date}>{post.date}</time>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-[min(1120px,calc(100%_-_40px))] border-t border-ink py-[100px] max-md:w-[min(680px,calc(100%_-_28px))] max-md:py-16">
        <div className="mb-12 flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
          <div>
            <span className="text-xs font-extrabold text-accent">ARCHIVE</span>
            <h2 className="mt-2 mb-0 text-balance font-serif text-5xl font-medium max-md:text-4xl">历史文章</h2>
          </div>
          <p className="text-[13px] text-muted">{archivePostCount} 篇旧博客文章，按原主题归档</p>
        </div>
        <div className="grid grid-cols-2 gap-x-16 max-md:grid-cols-1">
          {archiveGroups.map(group => (
            <section className="border-t border-line py-7" key={group.title}>
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h3 className="m-0 text-balance font-serif text-2xl font-medium">{group.title}</h3>
                <span className="text-xs text-muted tabular-nums">{group.posts.length}</span>
              </div>
              <ul className="m-0 list-none space-y-3 p-0">
                {group.posts.map(post => (
                  <li key={post.href}>
                    <Link className="text-pretty text-muted no-underline hover:text-accent" href={post.href}>{post.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-[100px] flex w-[min(1120px,calc(100%_-_40px))] items-center justify-between gap-8 border-y border-line py-8 max-md:w-[min(680px,calc(100%_-_28px))] max-md:flex-col max-md:items-start">
        <p className="m-0 text-pretty font-serif text-lg text-muted">想了解这个博客和作者？</p>
        <Link className="inline-flex min-h-11 items-center border-b border-ink text-sm font-bold no-underline" href="/about">关于与联系方式 →</Link>
      </section>
    </>
  )
}
