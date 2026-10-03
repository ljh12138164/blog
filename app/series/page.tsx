import type { Metadata } from 'next'
import Link from 'next/link'
import { series } from '@/lib/post-discovery'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: '系列专栏',
  description: '按阅读顺序整理的多人实时协同、Cloudflare 与 AI 工程实践。',
  alternates: { canonical: '/series' },
  twitter: {
    card: 'summary_large_image',
    title: `系列专栏 · ${site.name}`,
    description: '按阅读顺序整理的多人实时协同、Cloudflare 与 AI 工程实践。',
    images: ['/og-image.png']
  },
  openGraph: {
    title: `系列专栏 · ${site.name}`,
    description: '从基础问题读到工程落地。',
    url: '/series',
    images: ['/og-image.png']
  }
}

export default function SeriesPage() {
  return (
    <div className="mx-auto mb-24 w-[min(720px,calc(100%_-_40px))] max-md:w-[calc(100%_-_28px)]">
      <header className="border-b border-line py-16 max-md:py-12">
        <p className="m-0 font-mono text-[11px] font-bold text-accent">READING PATHS</p>
        <h1 className="mt-4 mb-5 text-balance text-5xl font-extrabold max-md:text-4xl">系列专栏</h1>
        <p className="m-0 text-pretty leading-8 text-muted">
          把零散的手记串成一条阅读路径，从基础问题读到工程落地。
        </p>
      </header>
      <div className="py-6">
        {series.map((item) => (
          <section className="border-b border-line py-8" key={item.slug}>
            <p className="m-0 font-mono text-xs text-muted tabular-nums">
              {item.posts.length} 篇 · 按学习顺序阅读
            </p>
            <h2 className="mt-3 mb-3 text-balance text-2xl font-bold">
              <Link
                className="inline-flex min-h-11 items-center hover:text-accent"
                href={`/series/${item.slug}`}
              >
                {item.title}
              </Link>
            </h2>
            <p className="m-0 text-pretty leading-7 text-muted">{item.description}</p>
            <Link
              className="mt-3 inline-flex min-h-11 items-center text-sm text-accent"
              href={`/series/${item.slug}`}
            >
              查看阅读顺序 →
            </Link>
          </section>
        ))}
      </div>
      <Link className="inline-flex min-h-11 items-center text-sm text-accent" href="/posts">
        全部文章 →
      </Link>
    </div>
  )
}
