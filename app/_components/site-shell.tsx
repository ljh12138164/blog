import Link from 'next/link'
import type { ReactNode } from 'react'
import { Search } from './search'

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/95">
        <nav
          className="mx-auto flex h-[76px] w-[min(1120px,calc(100%_-_40px))] items-center justify-between max-md:w-[min(680px,calc(100%_-_28px))]"
          aria-label="主导航"
        >
          <Link className="flex min-w-0 items-center gap-2.5 font-serif text-xl font-bold no-underline" href="/" aria-label="ljh的技术博客首页">
            <span className="size-[30px] shrink-0 overflow-hidden rounded-full" aria-hidden="true">
              <img className="size-full object-cover" src="/favicon.ico" alt="" />
            </span>
            <span className="truncate">ljh的技术博客</span>
          </Link>
          <div className="flex items-center gap-7 text-sm">
            <Link className="no-underline transition-colors hover:text-accent max-md:hidden" href="/#articles">文章</Link>
            <Link className="no-underline transition-colors hover:text-accent max-md:hidden" href="/about">关于</Link>
            <Search />
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mx-auto flex w-[min(1120px,calc(100%_-_40px))] justify-between border-t border-ink py-[42px] font-serif text-[13px] text-muted max-md:w-[min(680px,calc(100%_-_28px))] max-md:flex-col max-md:gap-4">
        <p>持续学习，不断进步。</p>
        <p>© {new Date().getFullYear()} ljh-blog · Powered by Nextra</p>
      </footer>
    </>
  )
}
