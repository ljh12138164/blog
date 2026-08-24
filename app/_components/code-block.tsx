'use client'

import type { ComponentProps } from 'react'
import { useRef, useState } from 'react'

type CodeBlockProps = ComponentProps<'pre'> & { 'data-language'?: string }

export function CodeBlock({ children, 'data-language': language, ...props }: CodeBlockProps) {
  const codeRef = useRef<HTMLPreElement>(null)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  async function copyCode() {
    const code = codeRef.current?.textContent
    if (!code) return

    try {
      await navigator.clipboard.writeText(code)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
    window.setTimeout(() => setCopyStatus('idle'), 1600)
  }

  return (
    <figure className="code-block my-8 overflow-hidden rounded-[10px] bg-code">
      <figcaption className="flex min-h-11 items-center justify-between bg-code-header px-4 font-sans text-xs text-muted">
        <span>{language?.toUpperCase() ?? 'CODE'}</span>
        <button
          className="min-h-10 cursor-pointer border-0 bg-transparent px-2 font-semibold text-muted hover:text-ink"
          type="button"
          onClick={copyCode}
          aria-live="polite"
        >
          {copyStatus === 'copied' ? '已复制' : copyStatus === 'error' ? '复制失败' : '复制代码'}
        </button>
      </figcaption>
      <pre
        {...props}
        ref={codeRef}
        data-language={language}
        className="m-0 max-w-full overflow-x-auto bg-transparent p-[22px] font-mono text-sm leading-[1.7] text-ink"
      >
        {children}
      </pre>
    </figure>
  )
}
