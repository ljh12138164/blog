'use client'

import { useEffect, useRef, useState } from 'react'

type SearchResult = {
  url: string
  meta: { title?: string }
  excerpt: string
}

type Pagefind = {
  init(): Promise<void>
  search(query: string): Promise<{
    results: Array<{ data(): Promise<SearchResult> }>
  }>
}

let pagefind: Pagefind | undefined

async function loadPagefind() {
  if (pagefind) return pagefind
  const pagefindUrl = '/_pagefind/pagefind.js'
  pagefind = (await import(/* webpackIgnore: true */ pagefindUrl)) as Pagefind
  await pagefind.init()
  return pagefind
}

export function Search() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [status, setStatus] = useState('输入关键词开始搜索')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(value => !value)
      }
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setStatus('输入关键词开始搜索')
      return
    }

    const timer = window.setTimeout(async () => {
      try {
        setStatus('搜索中…')
        const api = await loadPagefind()
        const response = await api.search(query)
        const items = await Promise.all(response.results.slice(0, 6).map(item => item.data()))
        setResults(items)
        setStatus(items.length ? `找到 ${items.length} 条结果` : '没有找到相关内容')
      } catch {
        setStatus('搜索索引将在执行 pnpm build 后可用')
      }
    }, 180)

    return () => window.clearTimeout(timer)
  }, [query])

  return (
    <>
      <button
        className="cursor-pointer rounded-lg border border-line bg-transparent px-[11px] py-[9px] text-muted transition-colors hover:border-muted hover:text-ink"
        type="button"
        onClick={() => setOpen(true)}
      >
        搜索 <kbd className="ml-3 text-[11px]">⌘ K</kbd>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/35 px-4 pt-[12vh] backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={() => setOpen(false)}
        >
          <section
            className="max-h-[72vh] w-full max-w-[620px] overflow-auto rounded-2xl border border-line bg-paper shadow-[0_24px_80px_rgba(0,0,0,.22)]"
            role="dialog"
            aria-modal="true"
            aria-label="站内搜索"
            onMouseDown={event => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-[18px] py-4">
              <span className="text-lg text-muted" aria-hidden="true">⌕</span>
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-[17px] text-ink outline-none placeholder:text-muted/70"
                ref={inputRef}
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="搜索文章…"
                aria-label="搜索文章"
              />
              <button className="cursor-pointer border-0 bg-transparent text-muted hover:text-ink" type="button" onClick={() => setOpen(false)} aria-label="关闭搜索">Esc</button>
            </div>
            <p className="m-0 px-[18px] py-3 text-xs text-muted" aria-live="polite">{status}</p>
            <ul className="m-0 list-none px-2.5 pb-3">
              {results.map(result => (
                <li key={result.url}>
                  <a className="grid gap-[7px] rounded-lg p-[13px] no-underline transition-colors hover:bg-[#e9e7df]" href={result.url} onClick={() => setOpen(false)}>
                    <strong>{result.meta.title ?? '未命名文章'}</strong>
                    <span className="font-serif text-sm leading-6 text-muted [&_mark]:bg-transparent [&_mark]:font-bold [&_mark]:text-accent" dangerouslySetInnerHTML={{ __html: result.excerpt }} />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </>
  )
}
