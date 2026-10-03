import Link from 'next/link'
import type { Heading } from 'nextra'
import type { ReactNode } from 'react'
import { site } from '@/lib/site'
import { ArticleDiscovery } from './article-discovery'
import { Comments } from './comments'
import { TableOfContents } from './table-of-contents'

type ArticleProps = {
  children: ReactNode
  toc?: Heading[]
  metadata?: unknown
}

type ArticleMetadata = {
  title?: string
  description?: string | null
  date?: string
  category?: string
  readingTime?: string
  alternates?: {
    canonical?: string
  }
}

export function Article({ children, toc, metadata = {} }: ArticleProps) {
  const meta = metadata as ArticleMetadata
  const canonicalPath = meta.alternates?.canonical || ''
  const postSlug = canonicalPath.match(/^\/posts\/([^/]+)$/)?.[1]
  const articleUrl = canonicalPath
    ? `${site.url}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
    : site.url

  const articleJsonLd = meta.title
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': ['TechArticle', 'BlogPosting'],
            '@id': `${articleUrl}#article`,
            isPartOf: {
              '@id': `${site.url}/#website`
            },
            headline: meta.title,
            description: meta.description || undefined,
            abstract: meta.description || undefined,
            image: [`${site.url}/og-image.png`],
            datePublished: meta.date ? new Date(meta.date).toISOString() : undefined,
            dateModified: meta.date ? new Date(meta.date).toISOString() : undefined,
            inLanguage: 'zh-CN',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': articleUrl,
              isPartOf: {
                '@id': `${site.url}/#website`
              }
            },
            author: {
              '@id': `${site.url}/#author`
            },
            publisher: {
              '@id': `${site.url}/#organization`
            },
            articleSection: meta.category || undefined,
            keywords: [meta.category, '前端架构', '全栈开发', '技术博客'].filter(Boolean)
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${articleUrl}#breadcrumb`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: '首页',
                item: site.url
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: '文章索引',
                item: `${site.url}/posts`
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: meta.title,
                item: articleUrl
              }
            ]
          }
        ]
      }
    : null

  return (
    <div className="relative mx-auto w-[min(720px,calc(100%_-_40px))] pt-16 pb-28 max-md:w-[calc(100%_-_28px)] max-md:pt-12">
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      <article
        className="article-content prose prose-lg min-w-0 max-w-none text-ink prose-headings:text-balance prose-headings:font-bold prose-headings:text-ink prose-p:text-pretty prose-p:leading-[1.85] prose-p:text-ink/90 prose-a:text-accent prose-strong:text-ink prose-li:leading-[1.8] prose-li:text-ink/90 prose-h2:mt-16 prose-h2:mb-4 prose-h2:text-[30px] prose-h2:leading-[1.35] prose-h3:mt-10 prose-h3:text-[22px] prose-blockquote:my-8 prose-blockquote:border-l-2 prose-blockquote:border-accent prose-blockquote:bg-accent-soft prose-blockquote:px-5 prose-blockquote:py-2 prose-blockquote:text-muted prose-img:rounded-md"
        data-pagefind-body
      >
        <header className="not-prose mb-12 border-b border-line pb-10">
          <div className="flex items-center justify-between gap-4">
            {meta.category && (
              <span className="font-mono text-[11px] font-bold text-accent uppercase">
                {meta.category}
              </span>
            )}
            <Link
              href="/posts"
              className="font-mono text-[11px] text-muted hover:text-accent no-underline transition-colors"
            >
              ← 返回文章列表
            </Link>
          </div>
          {meta.title && (
            <h1
              className="mt-4 mb-5 text-balance text-5xl leading-[1.16] font-extrabold text-ink max-md:text-[36px]"
              data-pagefind-meta="title"
            >
              {meta.title}
            </h1>
          )}
          {meta.description && (
            <p className="text-pretty text-[17px] leading-8 text-muted">{meta.description}</p>
          )}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-5 text-xs text-muted">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 font-mono text-xs font-bold text-accent">
                {site.author.englishName.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <Link
                  href="/about"
                  className="font-medium text-ink hover:text-accent no-underline transition-colors"
                  title="查看作者简介"
                >
                  {site.author.name}
                </Link>
                <span className="mx-2 text-line">·</span>
                <span className="text-muted">{site.author.jobTitle}</span>
              </div>
            </div>
            {meta.date && (
              <p className="m-0 font-mono text-[11px] text-muted uppercase tabular-nums">
                <time dateTime={meta.date}>{meta.date}</time>
                {meta.readingTime && <> · {meta.readingTime}</>}
              </p>
            )}
          </div>
        </header>
        {toc && <TableOfContents toc={toc} />}
        {children}
        <footer
          className="not-prose mt-16 rounded-xl border border-line bg-surface/50 p-6 backdrop-blur-xs max-md:p-5"
          data-pagefind-ignore
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 font-mono text-sm font-bold text-accent">
              {site.author.englishName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="m-0 text-base font-bold text-ink">
                  <Link href="/about" className="hover:text-accent no-underline transition-colors">
                    {site.author.name} ({site.author.englishName})
                  </Link>
                </h3>
                <Link
                  href="/about"
                  className="font-mono text-xs font-medium text-accent hover:underline"
                >
                  关于作者 →
                </Link>
              </div>
              <p className="mt-1 mb-3 text-sm leading-6 text-muted">
                专注前端架构设计、多人实时协同（CRDT/OT）、现代 Web 性能调优与 AI Agent
                工程化实践。坚持写自己真正实践过的思考与取舍。
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted">
                <a
                  href={site.author.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-muted hover:text-accent no-underline transition-colors"
                >
                  GitHub @{site.author.englishName}
                </a>
                <span className="text-line">/</span>
                <Link
                  href="/posts"
                  className="text-muted hover:text-accent no-underline transition-colors"
                >
                  全部手记归档
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </article>
      {postSlug && <ArticleDiscovery slug={postSlug} />}
      <Comments />
    </div>
  )
}
