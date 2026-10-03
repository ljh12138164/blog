'use client'

import { useEffect, useState } from 'react'

type SearchResult = { url: string; meta: { title?: string }; excerpt: string }
type Pagefind = {
  init(): Promise<void>
  search(query: string): Promise<{ results: Array<{ data(): Promise<SearchResult> }> }>
}

let pagefind: Promise<Pagefind> | undefined
let loadAttempt = 0

async function loadPagefind() {
  if (!pagefind) {
    // Browsers cache failed module loads; a retry needs a fresh module URL.
    const pagefindUrl = `/_pagefind/pagefind.js${loadAttempt ? `?retry=${loadAttempt}` : ''}`
    pagefind = import(/* webpackIgnore: true */ pagefindUrl)
      .then(async (module: Pagefind) => {
        await module.init()
        return module
      })
      .catch((error: unknown) => {
        pagefind = undefined
        loadAttempt += 1
        throw error
      })
  }
  return pagefind
}

export function usePostSearch(query: string) {
  const term = query.trim()
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({
    query: '',
    attempt: 0,
    results: [] as SearchResult[],
    error: false
  })

  useEffect(() => {
    if (!term) return
    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        const api = await loadPagefind()
        const response = await api.search(term)
        const results = (await Promise.all(response.results.map((item) => item.data())))
          .map((item) => ({ ...item, url: item.url.replace(/\.html$/, '').replace(/\/$/, '') }))
          .filter((item) => /^\/posts\/[^/]+$/.test(item.url))
        if (!cancelled) setState({ query: term, attempt, results, error: false })
      } catch {
        if (!cancelled) setState({ query: term, attempt, results: [], error: true })
      }
    }, 180)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [term, attempt])

  const loading = Boolean(term) && (state.query !== term || state.attempt !== attempt)
  return {
    results: term && !loading ? state.results : [],
    loading,
    error: Boolean(term) && !loading && state.error,
    retry: () => setAttempt((value) => value + 1)
  }
}
