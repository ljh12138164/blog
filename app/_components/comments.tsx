'use client'

import Giscus from '@giscus/react'
import { useEffect, useState } from 'react'
import type { Theme } from '@/lib/theme'

export function Comments() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const root = document.documentElement
    const syncTheme = () => setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light')
    syncTheme()

    const observer = new MutationObserver(syncTheme)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className="mt-16 border-t border-line pt-10"
      aria-labelledby="comments-title"
      data-pagefind-ignore
    >
      <h2 id="comments-title" className="mb-6 text-2xl font-bold text-ink text-balance">
        评论
      </h2>
      {theme && (
        <Giscus
          key={theme}
          repo="ljh12138164/blog-comment"
          repoId="R_kgDOUjGFLg"
          category="General"
          categoryId="DIC_kwDOUjGFLs4DGsrC"
          mapping="pathname"
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={theme}
          lang="zh-CN"
          loading="lazy"
        />
      )}
    </section>
  )
}
