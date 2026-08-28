import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { site } from '@/lib/site'
import { Search } from './search'

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/95">
        <nav
          className="mx-auto flex h-[76px] w-[min(1120px,calc(100%_-_40px))] items-center justify-between max-md:w-[min(680px,calc(100%_-_28px))]"
          aria-label="主导航"
        >
          <Link
            className="flex min-w-0 items-center gap-2.5 font-serif text-xl font-bold no-underline"
            href="/"
            aria-label="ljh的技术博客首页"
          >
            <span className="size-[30px] shrink-0 overflow-hidden rounded-full" aria-hidden="true">
              <Image
                className="size-full object-cover"
                src="/favicon.webp"
                alt="图片"
                width={30}
                height={30}
              />
            </span>
            <span className="truncate">ljh的技术博客</span>
          </Link>
          <div className="flex items-center gap-7 text-sm">
            <Link className="no-underline transition-colors hover:text-accent" href="/posts">
              文章
            </Link>
            <Link
              className="no-underline transition-colors hover:text-accent max-md:hidden"
              href="/about"
            >
              关于
            </Link>
            <Search />
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mx-auto flex w-[min(1120px,calc(100%_-_40px))] flex-col gap-4 border-t border-ink py-[42px] text-[13px] text-muted max-md:w-[min(680px,calc(100%_-_28px))]">
        <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
          <p className="m-0">持续学习，不断进步。</p>
          <div className="flex flex-wrap items-center gap-5 text-[13px]">
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
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-line/60 pt-4 text-xs max-md:flex-col max-md:items-start">
          <p className="m-0">
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
