import Link from 'next/link'
import type { ReactNode } from 'react'
import { site } from '@/lib/site'
import { Search } from './search'
import { ThemeToggle } from './theme-toggle'

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95">
        <nav
          className="mx-auto flex h-[68px] w-[min(720px,calc(100%_-_40px))] items-center justify-between max-md:w-[calc(100%_-_28px)]"
          aria-label="主导航"
        >
          <Link
            className="min-w-0 truncate text-lg font-extrabold no-underline"
            href="/"
            aria-label="ljh的技术博客首页"
          >
            ljh<span className="text-accent">.</span>notes
          </Link>
          <div className="flex items-center gap-1 text-sm max-sm:gap-0">
            <Link className="no-underline transition-colors hover:text-accent" href="/posts">
              <span className="inline-flex min-h-11 items-center px-3">文章</span>
            </Link>
            <Link
              className="no-underline transition-colors hover:text-accent max-sm:hidden"
              href="/about"
            >
              <span className="inline-flex min-h-11 items-center px-3">关于</span>
            </Link>
            <Search />
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mx-auto flex w-[min(720px,calc(100%_-_40px))] flex-col gap-4 border-t border-line py-10 text-xs text-muted max-md:w-[calc(100%_-_28px)]">
        <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
          <p className="m-0 font-mono">持续修订，写给下一次遇到同样问题的自己。</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link className="no-underline transition-colors hover:text-accent" href="/about">
              关于博主
            </Link>
            <Link className="no-underline transition-colors hover:text-accent" href="/privacy">
              隐私权政策
            </Link>
            <a
              className="no-underline transition-colors hover:text-accent"
              href={site.author.github}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              className="no-underline transition-colors hover:text-accent"
              href="https://news.ljhboard.cn/"
              target="_blank"
              rel="noreferrer"
            >
              今日热点
            </a>
            <a
              className="no-underline transition-colors hover:text-accent"
              href="https://token.ljhboard.cn/"
              target="_blank"
              rel="noreferrer"
            >
              Token Paper
            </a>
            <a
              className="no-underline transition-colors hover:text-accent"
              href="https://tools.ljhboard.cn/"
              target="_blank"
              rel="noreferrer"
            >
              LJH Tools
            </a>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-line pt-4 max-md:flex-col max-md:items-start">
          <p className="m-0 tabular-nums">
            © {new Date().getFullYear()} {site.name} · Powered by Nextra
          </p>
          <a
            className="no-underline transition-colors hover:text-accent"
            href={site.icp.link}
            target="_blank"
            rel="noreferrer"
          >
            {site.icp.number}
          </a>
        </div>
      </footer>
    </>
  )
}
