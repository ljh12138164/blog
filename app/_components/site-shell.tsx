import Link from 'next/link'
import type { ReactNode } from 'react'
import { Search } from './search'

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/90 backdrop-blur-[14px]">
        <nav
          className="mx-auto flex h-[76px] w-[min(1120px,calc(100%_-_40px))] items-center justify-between max-md:w-[min(680px,calc(100%_-_28px))]"
          aria-label="主导航"
        >
          <Link className="flex items-center gap-2.5 font-serif text-xl font-bold no-underline" href="/" aria-label="个人博客首页">
            <span className="grid size-[30px] place-items-center rounded-full bg-ink text-paper">✦</span>
            个人博客
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
        <p>记录技术、阅读、生活与思考。</p>
        <p>© {new Date().getFullYear()} 个人博客 · Powered by Nextra</p>
      </footer>
    </>
  )
}
