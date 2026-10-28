import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { PostsIndex } from '@/app/_components/posts-index'
import { getAllPosts } from '@/lib/post-index'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: '文章索引',
  description: `浏览 ${site.name} 的全部技术文章，按发布时间与分类查找前端架构、实时协同、Web 性能、边缘计算与 AI 工程实践。`,
  alternates: { canonical: '/posts' },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    title: `文章索引 · ${site.name}`,
    description: `浏览 ${site.name} 的全部技术文章。`,
    url: '/posts',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `文章索引 · ${site.name}` }]
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
        <Link className="mt-4 inline-flex min-h-11 items-center text-sm text-accent" href="/series">
          按专栏连续阅读 →
        </Link>
      </header>
      <Suspense fallback={<PostsIndex posts={posts} readUrl={false} />}>
        <PostsIndex posts={posts} />
      </Suspense>
    </div>
  )
}
