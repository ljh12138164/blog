import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostList } from '@/app/_components/post-list'
import { getSeriesPosts, series } from '@/lib/post-discovery'
import { getAllPosts } from '@/lib/post-index'
import { site } from '@/lib/site'

export const dynamicParams = false
export function generateStaticParams() {
  return series.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = series.find((item) => item.slug === slug)
  if (!item) notFound()
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: `/series/${slug}` },
    openGraph: {
      title: `${item.title} · ${site.name}`,
      description: item.description,
      url: `/series/${slug}`,
      images: ['/og-image.png']
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.description,
      images: ['/og-image.png']
    }
  }
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = series.find((item) => item.slug === slug)
  if (!item) notFound()
  const posts = getSeriesPosts(item, await getAllPosts())
  return (
    <div className="mx-auto mb-24 w-[min(720px,calc(100%_-_40px))] max-md:w-[calc(100%_-_28px)]">
      <header className="border-b border-line py-16 max-md:py-12">
        <Link className="inline-flex min-h-11 items-center text-xs text-accent" href="/series">
          ← 全部专栏
        </Link>
        <h1 className="mt-4 mb-5 text-balance text-5xl leading-tight font-extrabold max-md:text-4xl">
          {item.title}
        </h1>
        <p className="m-0 text-pretty leading-8 text-muted">{item.description}</p>
        <p className="mt-5 mb-0 font-mono text-xs text-muted tabular-nums">
          {posts.length} 篇 · 以下为建议阅读顺序
        </p>
      </header>
      <PostList posts={posts} ordered />
    </div>
  )
}
