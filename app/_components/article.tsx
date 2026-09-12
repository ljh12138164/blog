import type { Heading } from 'nextra'
import type { ReactNode } from 'react'
import { site } from '@/lib/site'

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
  const articleUrl = canonicalPath
    ? `${site.url}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
    : site.url

  const articleJsonLd = meta.title
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'TechArticle',
            '@id': `${articleUrl}#article`,
            headline: meta.title,
            description: meta.description || undefined,
            datePublished: meta.date ? new Date(meta.date).toISOString() : undefined,
            dateModified: meta.date ? new Date(meta.date).toISOString() : undefined,
            inLanguage: 'zh-CN',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': articleUrl
            },
            author: {
              '@type': 'Person',
              name: site.author.name,
              url: site.author.url,
              sameAs: site.author.sameAs
            },
            publisher: {
              '@type': 'Person',
              name: site.author.name,
              url: site.url
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
                name: meta.category || '文章归档',
                item: `${site.url}/#articles`
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
          {meta.category && (
            <span className="font-mono text-[11px] font-bold text-accent uppercase">
              {meta.category}
            </span>
          )}
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
          {meta.date && (
            <p className="mt-6 mb-0 font-mono text-[11px] text-muted uppercase tabular-nums">
              <time dateTime={meta.date}>{meta.date}</time>
              {meta.readingTime && <> · {meta.readingTime}</>}
            </p>
          )}
        </header>
        {children}
      </article>
      {toc && toc.length > 0 && (
        <div className="absolute top-16 bottom-28 left-[calc(100%+40px)] w-[180px] max-xl:hidden">
          <aside
            className="sticky top-24 self-start border-l border-line pl-5 text-xs max-lg:hidden"
            aria-label="文章目录"
            data-pagefind-ignore
          >
            <strong className="font-mono text-[11px] text-ink">本页目录</strong>
            <ol className="list-none p-0">
              {toc.map((item) => (
                <li key={item.id} className={`my-3 ${item.depth === 3 ? 'pl-3' : ''}`}>
                  <a
                    className="text-muted no-underline transition-colors hover:text-accent"
                    href={`#${item.id}`}
                  >
                    {item.value}
                  </a>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      )}
    </div>
  )
}
