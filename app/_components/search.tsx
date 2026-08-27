'use client'

import { useEffect, useRef, useState } from 'react'

type SearchResult = { url: string; meta: { title?: string }; excerpt: string }
type Pagefind = {
  init(): Promise<void>
  search(query: string): Promise<{ results: Array<{ data(): Promise<SearchResult> }> }>
}

let pagefind: Pagefind | undefined

function normalizeResultUrl(url: string) {
  return url.endsWith('.html') ? url.slice(0, -5) : url
}

async function loadPagefind() {
  if (pagefind) return pagefind
  const pagefindUrl = '/_pagefind/pagefind.js'
  pagefind = (await import(/* webpackIgnore: true */ pagefindUrl)) as Pagefind
  await pagefind.init()
  return pagefind
}

export function Search() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [status, setStatus] = useState('输入关键词开始搜索')

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

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setStatus('输入关键词开始搜索')
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        setStatus('搜索中…')
        const api = await loadPagefind()
        const response = await api.search(query)
        const items = await Promise.all(response.results.slice(0, 6).map((item) => item.data()))
        if (cancelled) return
        setResults(items)
        setStatus(items.length ? `找到 ${items.length} 条结果` : '没有找到相关内容')
      } catch {
        if (cancelled) return
        setResults([])
        setStatus('搜索索引暂不可用，请在构建完成后重试')
      }
    }, 180)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query])

  return (
    <>
      <button
        className="min-h-11 cursor-pointer rounded-lg border border-line bg-transparent px-[11px] text-muted hover:border-muted hover:text-ink"
        type="button"
        onClick={openSearch}
      >
        搜索 <kbd className="ml-3 text-[11px] max-sm:hidden">⌘ K</kbd>
      </button>
      <dialog
        className="search-dialog m-0 h-dvh max-h-none w-full max-w-none bg-transparent"
        ref={dialogRef}
        aria-label="站内搜索"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeSearch()
        }}
      >
        <section className="mx-auto max-h-[72dvh] w-full max-w-[620px] overflow-auto rounded-2xl border border-line bg-paper shadow-xl">
          <div className="flex items-center gap-3 border-b border-line px-[18px] py-4">
            <span className="text-lg text-muted" aria-hidden="true">
              ⌕
            </span>
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-[17px] text-ink outline-none placeholder:text-muted/70"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索全部文章…"
              aria-label="搜索全部文章"
            />
            <button
              className="min-h-10 cursor-pointer border-0 bg-transparent px-2 text-muted hover:text-ink"
              type="button"
              onClick={closeSearch}
            >
              关闭
            </button>
          </div>
          <p className="m-0 px-[18px] py-3 text-xs text-muted" aria-live="polite">
            {status}
          </p>
          <ul className="m-0 list-none px-2.5 pb-3">
            {results.map((result) => (
              <li key={result.url}>
                <a
                  className="grid min-h-11 gap-[7px] rounded-lg p-[13px] no-underline hover:bg-code"
                  href={normalizeResultUrl(result.url)}
                  onClick={closeSearch}
                >
                  <strong className="text-pretty">{result.meta.title ?? '未命名文章'}</strong>
                  <span className="text-pretty font-serif text-sm leading-6 text-muted">
                    {result.excerpt.replace(/<[^>]*>/g, '')}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </dialog>
    </>
  )
}
