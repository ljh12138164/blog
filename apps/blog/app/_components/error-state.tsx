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
      className="mx-auto flex min-h-[calc(100dvh-68px)] w-[min(720px,calc(100%_-_40px))] flex-col justify-center py-20 max-md:w-[calc(100%_-_28px)] max-md:py-14"
      aria-labelledby={titleId}
      data-error-kind={kind}
      data-pagefind-ignore
    >
      <div className="border-y border-line py-12 max-md:py-10">
        <div className="flex items-baseline gap-5 max-sm:flex-col max-sm:gap-2">
          <span
            className="font-mono text-7xl leading-none font-bold text-accent tabular-nums max-md:text-6xl"
            aria-hidden="true"
          >
            {status}
          </span>
          <p className="m-0 font-mono text-[11px] text-muted uppercase">{eyebrow}</p>
        </div>
        <h1
          className="mt-8 mb-0 max-w-[640px] text-balance text-5xl leading-[1.15] font-extrabold max-md:text-4xl"
          id={titleId}
        >
          {title}
        </h1>
        <p className="mt-5 mb-0 max-w-[590px] text-pretty text-base leading-8 text-muted">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2 text-sm font-bold">
          {onRetry ? (
            <button
              className="min-h-11 cursor-pointer border-0 border-b border-accent bg-transparent px-0 text-accent"
              type="button"
              onClick={onRetry}
            >
              重新加载 <span aria-hidden="true">↻</span>
            </button>
          ) : (
            <Link
              className="inline-flex min-h-11 items-center border-b border-accent text-accent no-underline"
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

      <div className="flex min-w-0 items-center gap-3 border-b border-line py-4 font-mono text-[11px] text-muted uppercase">
        <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
        <span className="truncate" title={trace}>
          {trace}
        </span>
      </div>
    </section>
  )
}
