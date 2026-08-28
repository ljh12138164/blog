'use client'

import Link from 'next/link'

type ErrorStateProps = {
  kind: 'not-found' | 'error'
  status: string
  eyebrow: string
  title: string
  description: string
  trace: string
  onRetry?: () => void
}

export function ErrorState({
  kind,
  status,
  eyebrow,
  title,
  description,
  trace,
  onRetry
}: ErrorStateProps) {
  const titleId = `${kind}-title`

  return (
    <section
      className="mx-auto flex min-h-[calc(100dvh-76px)] w-[min(1120px,calc(100%_-_40px))] flex-col justify-center py-20 max-md:min-h-[calc(100dvh-76px)] max-md:w-[min(680px,calc(100%_-_28px))] max-md:py-14"
      aria-labelledby={titleId}
      data-error-kind={kind}
      data-pagefind-ignore
    >
      <div className="grid grid-cols-[minmax(220px,.72fr)_minmax(0,1.28fr)] border-y border-ink max-md:grid-cols-1">
        <div className="flex flex-col justify-between border-r border-ink py-10 pr-12 max-md:border-r-0 max-md:border-b max-md:py-7 max-md:pr-0">
          <span className="text-xs font-extrabold tracking-[.1em] text-accent uppercase">
            HTTP status
          </span>
          <span
            className="mt-16 font-serif text-[clamp(88px,13vw,168px)] leading-[.78] font-medium tracking-[-.08em] tabular-nums max-md:mt-10 max-md:text-[96px]"
            aria-hidden="true"
          >
            {status}
          </span>
        </div>

        <div className="flex min-w-0 flex-col justify-center py-12 pl-16 max-md:py-10 max-md:pl-0">
          <p className="m-0 text-xs font-extrabold tracking-[.08em] text-accent uppercase">
            {eyebrow}
          </p>
          <h1
            className="mt-4 mb-0 max-w-[680px] text-balance font-serif text-[clamp(36px,5vw,58px)] leading-[1.12] font-medium"
            id={titleId}
          >
            {title}
          </h1>
          <p className="mt-6 mb-0 max-w-[590px] text-pretty text-base leading-8 text-muted">
            {description}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-bold">
            {onRetry ? (
              <button
                className="min-h-11 cursor-pointer border-0 border-b border-ink bg-transparent px-0 text-ink hover:text-accent"
                type="button"
                onClick={onRetry}
              >
                重新加载 <span aria-hidden="true">↻</span>
              </button>
            ) : (
              <Link
                className="inline-flex min-h-11 items-center border-b border-ink no-underline hover:text-accent"
                href="/#articles"
              >
                浏览文章 <span aria-hidden="true">→</span>
              </Link>
            )}
            <Link
              className="inline-flex min-h-11 items-center text-muted no-underline hover:text-accent"
              href="/"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3 border-b border-line py-4 font-mono text-[11px] tracking-[.06em] text-muted uppercase">
        <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
        <span className="truncate" title={trace}>
          {trace}
        </span>
      </div>
    </section>
  )
}
