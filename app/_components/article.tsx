import type { Heading } from 'nextra'
import type { ReactNode } from 'react'

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
}

export function Article({ children, toc, metadata = {} }: ArticleProps) {
  const meta = metadata as ArticleMetadata
  return (
    <div className="mx-auto grid w-[min(1120px,calc(100%_-_40px))] grid-cols-[minmax(0,760px)_220px] justify-between gap-[72px] py-[90px] pb-[120px] max-md:block max-md:w-[min(680px,calc(100%_-_28px))] max-md:pt-16">
      <article
        className="prose prose-lg min-w-0 max-w-none font-serif prose-headings:font-serif prose-headings:text-ink prose-p:text-[#303b36] prose-li:text-[#303b36] prose-h2:mt-16 prose-h2:mb-4 prose-h2:text-[32px] prose-h2:leading-[1.35] prose-h3:mt-[38px] prose-h3:text-[23px] prose-blockquote:my-[34px] prose-blockquote:border-l-[3px] prose-blockquote:border-accent prose-blockquote:bg-accent/[.06] prose-blockquote:px-6 prose-blockquote:py-3 prose-pre:overflow-x-auto prose-pre:rounded-[10px] prose-pre:bg-ink prose-pre:p-[22px] prose-pre:text-sm prose-pre:leading-[1.7] prose-pre:text-paper [&>h1:first-child]:hidden [&_code:not(pre_code)]:rounded [&_code:not(pre_code)]:bg-[#e7e5dc] [&_code:not(pre_code)]:px-[.35em] [&_code:not(pre_code)]:py-[.14em] [&_code:not(pre_code)]:text-[.88em]"
        data-pagefind-body
      >
        <header className="not-prose mb-[46px] border-b border-line pb-[46px]">
          {meta.category && <span className="text-xs font-extrabold tracking-[.18em] text-accent">{meta.category}</span>}
          {meta.title && <h1 className="my-[18px] mb-5 font-serif text-[clamp(42px,6vw,68px)] leading-[1.12] font-medium tracking-[-.04em]" data-pagefind-meta="title">{meta.title}</h1>}
          {meta.description && <p className="font-serif text-xl leading-[1.7] text-muted">{meta.description}</p>}
          {meta.date && (
            <p className="mb-3 text-xs tracking-[.06em] text-muted uppercase">
              <time dateTime={meta.date}>{meta.date}</time>
              {meta.readingTime && <> · {meta.readingTime}</>}
            </p>
          )}
        </header>
        {children}
      </article>
      {toc && toc.length > 0 && (
        <aside className="sticky top-28 self-start border-l border-line pl-5 text-[13px] max-md:hidden" aria-label="文章目录" data-pagefind-ignore>
          <strong>本页目录</strong>
          <ol className="list-none p-0">
            {toc.map(item => (
              <li key={item.id} className={`my-3 ${item.depth === 3 ? 'pl-3' : ''}`}>
                <a className="text-muted no-underline transition-colors hover:text-accent" href={`#${item.id}`}>{item.value}</a>
              </li>
            ))}
          </ol>
        </aside>
      )}
    </div>
  )
}
