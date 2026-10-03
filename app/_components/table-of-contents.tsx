'use client'

import type { Heading } from 'nextra'
import { useEffect, useRef, useState } from 'react'

export function TableOfContents({ toc }: { toc: Heading[] }) {
  const [active, setActive] = useState('')
  const mobileRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const headings = toc
      .map(({ id }) => document.getElementById(id))
      .filter((node) => node !== null)
    let frame = 0
    function update() {
      let current = headings[0]?.id ?? ''
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > 140) break
        current = heading.id
      }
      setActive(current)
      frame = 0
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.cancelAnimationFrame(frame)
    }
  }, [toc])

  function links(mobile: boolean) {
    return (
      <ol className="m-0 list-none p-0">
        {toc.map((item) => (
          <li key={item.id} className={item.depth > 2 ? 'pl-3' : ''}>
            <a
              className={`flex min-h-11 items-center text-pretty text-sm no-underline hover:text-accent ${active === item.id ? 'font-semibold text-accent' : 'text-muted'}`}
              href={`#${item.id}`}
              aria-current={active === item.id ? 'location' : undefined}
              onClick={() => {
                setActive(item.id)
                if (mobile && mobileRef.current) mobileRef.current.open = false
              }}
            >
              {item.value}
            </a>
          </li>
        ))}
      </ol>
    )
  }

  if (!toc.length) return null
  return (
    <>
      <details
        ref={mobileRef}
        className="not-prose sticky top-[68px] z-10 mb-8 border-y border-line bg-paper xl:hidden"
        data-pagefind-ignore
      >
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 py-3 text-sm font-semibold">
          <span>本页目录</span>
          <span className="text-xs font-normal text-muted">展开 / 收起</span>
        </summary>
        <nav
          className="max-h-[55dvh] overflow-y-auto border-t border-line px-3 py-2"
          aria-label="移动端文章目录"
        >
          {links(true)}
        </nav>
      </details>
      <div
        className="not-prose absolute top-16 bottom-28 left-[calc(100%+40px)] w-[180px] max-xl:hidden"
        data-pagefind-ignore
      >
        <nav
          className="sticky top-24 max-h-[calc(100dvh_-_120px)] overflow-y-auto border-l border-line pl-5"
          aria-label="文章目录"
        >
          <strong className="font-mono text-[11px] text-ink">本页目录</strong>
          {links(false)}
        </nav>
      </div>
    </>
  )
}
