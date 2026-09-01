'use client'

import { useEffect, useState } from 'react'
import { type Theme, themeStorageKey } from '@/lib/theme'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  }, [])

  function toggleTheme() {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme
    window.localStorage.setItem(themeStorageKey, nextTheme)
    setTheme(nextTheme)
  }

  const nextLabel = theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'

  return (
    <button
      className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent font-mono text-sm text-muted hover:bg-code hover:text-ink"
      type="button"
      aria-label={nextLabel}
      title={nextLabel}
      onClick={toggleTheme}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '◐'}</span>
    </button>
  )
}
