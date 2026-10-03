'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { getPostsHref } from '@/lib/post-discovery'
import { usePostSearch } from '@/lib/use-post-search'

export function Search() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const { results, loading, error, retry } = usePostSearch(query)
  const status = !query.trim()
    ? '输入关键词开始搜索'
    : loading
      ? '搜索中…'
      : error
        ? '搜索索引暂不可用，请重试'
        : results.length
          ? `找到 ${results.length} 篇文章${results.length > 6 ? ' · 显示前 6 篇' : ''}`
          : '没有找到相关内容'

  function openSearch() {
    dialogRef.current?.showModal()
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  function closeSearch() {
    dialogRef.current?.close()
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (dialogRef.current?.open) closeSearch()
        else openSearch()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <button
        className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-muted hover:bg-code hover:text-ink"
        type="button"
        onClick={openSearch}
        aria-label="搜索文章"
        title="搜索文章（⌘ K）"
      >
        <span className="font-mono text-lg" aria-hidden="true">
          ⌕
        </span>
      </button>
      <dialog
        className="search-dialog m-0 h-dvh max-h-none w-full max-w-none bg-transparent"
        ref={dialogRef}
        aria-label="站内搜索"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeSearch()
        }}
      >
        <section className="mx-auto max-h-[72dvh] w-full max-w-[600px] overflow-auto rounded-lg border border-line bg-paper">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="font-mono text-lg text-muted" aria-hidden="true">
              ⌕
            </span>
            <input
              className="min-h-11 min-w-0 flex-1 border-0 bg-transparent text-base text-ink outline-none placeholder:text-muted/70"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索全部文章…"
              aria-label="搜索全部文章"
            />
            <button
              className="min-h-11 cursor-pointer border-0 bg-transparent px-2 text-sm text-muted hover:text-ink"
              type="button"
              onClick={closeSearch}
            >
              关闭
            </button>
          </div>
          <p className="m-0 px-4 py-3 font-mono text-[11px] text-muted" aria-live="polite">
            {status}
          </p>
          {error && (
            <button
              className="mx-4 mb-3 min-h-11 cursor-pointer text-sm text-accent"
              type="button"
              onClick={retry}
            >
              重新搜索
            </button>
          )}
          <ul className="m-0 list-none px-2 pb-3">
            {results.slice(0, 6).map((result) => (
              <li key={result.url}>
                <a
                  className="grid min-h-11 gap-1 rounded-md px-3 py-3 no-underline hover:bg-code"
                  href={result.url}
                  onClick={closeSearch}
                >
                  <strong className="text-pretty">{result.meta.title ?? '未命名文章'}</strong>
                  <span className="text-pretty text-sm leading-6 text-muted">
                    {result.excerpt.replace(/<[^>]*>/g, '')}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {query.trim() && !loading && !error && (
            <Link
              className="flex min-h-11 items-center border-t border-line px-4 py-3 text-sm text-accent"
              href={getPostsHref(query)}
              onClick={closeSearch}
            >
              查看完整结果与分类筛选 →
            </Link>
          )}
        </section>
      </dialog>
    </>
  )
}
