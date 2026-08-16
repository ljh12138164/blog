import type { Metadata } from 'next'
import Link from 'next/link'
import { posts } from '@/lib/posts'

export const metadata: Metadata = {
  alternates: { canonical: '/' }
}

export default function HomePage() {
  return (
    <>
      <section
        className="mx-auto min-h-[620px] w-[min(1120px,calc(100%_-_40px))] py-[120px] pb-[90px] max-md:min-h-0 max-md:w-[min(680px,calc(100%_-_28px))] max-md:py-[90px]"
        data-pagefind-ignore
      >
        <span className="text-xs font-extrabold tracking-[.18em] text-accent">THINK · BUILD · REFLECT</span>
        <h1 className="my-[26px] mb-[34px] max-w-[900px] font-serif text-[clamp(54px,8vw,102px)] leading-[.99] font-medium tracking-[-.055em] max-md:text-[clamp(48px,15vw,70px)]">
          认真生活，<br /><em className="font-normal text-accent">也认真理解世界。</em>
        </h1>
        <p className="mb-[46px] max-w-[600px] font-serif text-xl leading-[1.8] text-muted">
          这里记录技术实践、阅读笔记、生活观察，以及一些尚未想清楚的问题。
        </p>
        <a className="inline-flex items-center gap-[42px] border-b border-ink pb-2 text-sm font-bold no-underline" href="#articles">
          开始阅读 <span>↓</span>
        </a>
      </section>

      <section className="mx-auto w-[min(1120px,calc(100%_-_40px))] border-t border-ink py-[100px] max-md:w-[min(680px,calc(100%_-_28px))]" id="articles">
        <div className="mb-11 flex items-end justify-between max-md:flex-col max-md:items-start">
          <div>
            <span className="text-xs font-extrabold tracking-[.18em] text-accent">LATEST NOTES</span>
            <h2 className="mt-2 mb-0 font-serif text-5xl font-medium">最近文章</h2>
          </div>
          <p className="text-[13px] text-muted">{posts.length} 篇关于技术与思考的笔记</p>
        </div>
        <div>
          {posts.map((post, index) => (
            <article
              className="grid grid-cols-[64px_1fr_auto] gap-7 border-t border-line py-9 last:border-b max-md:grid-cols-[34px_1fr]"
              key={post.slug}
            >
              <span className="font-serif text-accent italic">0{index + 1}</span>
              <div>
                <p className="mb-3 text-xs tracking-[.06em] text-muted uppercase">{post.category} · {post.readingTime}</p>
                <h3 className="mb-3 font-serif text-[29px] font-medium">
                  <Link className="no-underline transition-colors hover:text-accent" href={`/posts/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="m-0 max-w-[680px] leading-[1.7] text-muted">{post.description}</p>
              </div>
              <time className="font-serif text-[13px] text-muted max-md:hidden" dateTime={post.date}>{post.date}</time>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
