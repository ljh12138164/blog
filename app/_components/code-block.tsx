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
    <figure className="code-block my-8 max-w-full overflow-hidden rounded-md bg-code">
      <figcaption className="flex min-h-11 items-center justify-between border-b border-line bg-code-header px-4 font-mono text-[11px] text-muted">
        <span>{language?.toUpperCase() ?? 'CODE'}</span>
        <button
          className="min-h-11 cursor-pointer border-0 bg-transparent px-2 font-sans text-xs font-semibold text-muted hover:text-ink"
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
        className="m-0 max-w-full overflow-x-auto bg-transparent p-5 font-mono text-sm leading-[1.7] text-ink"
      >
        {children}
      </pre>
    </figure>
  )
}
