'use client'

import { useEffect, useState } from 'react'

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let ticking = false

    function updateProgress() {
      const { scrollHeight, clientHeight } = document.documentElement
      const maxScroll = scrollHeight - clientHeight
      const currentScroll = window.scrollY

      if (maxScroll > 0) {
        const pct = Math.min(100, Math.max(0, (currentScroll / maxScroll) * 100))
        setProgress(pct)
      } else {
        setProgress(0)
      }

      setVisible(currentScroll > 240)
      ticking = false
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    updateProgress()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  function scrollToTop() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    })
  }

  // 半径 18 对应的圆周长: 2 * π * 18 ≈ 113.1
  const circumference = 113.1
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <>
      {/* 1. 顶部粘性导航栏底部的阅读滚动进度条 */}
      <div
        className="pointer-events-none fixed top-[67px] left-0 z-30 h-[2px] w-full bg-transparent"
        aria-hidden="true"
      >
        <div
          className="h-full bg-accent transition-[width] duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 2. 右下角带环形进度条的回到顶部按钮 (参考 Cloudflare Docs 设计) */}
      <div
        className={`fixed right-6 bottom-6 z-30 transition-all duration-300 max-md:right-4 max-md:bottom-4 ${
          visible
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={scrollToTop}
          className="group relative flex size-11 cursor-pointer items-center justify-center rounded-full border border-line bg-paper/90 text-ink shadow-sm backdrop-blur-xs transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="回到顶部"
          title={`已阅读 ${Math.round(progress)}% · 点击回到顶部`}
        >
          {/* 外环 SVG 进度条 */}
          <svg
            className="absolute inset-0 size-full -rotate-90 origin-center"
            viewBox="0 0 44 44"
            aria-hidden="true"
          >
            <circle
              cx="22"
              cy="22"
              r="18"
              className="stroke-line/40"
              strokeWidth="2.5"
              fill="none"
            />
            <circle
              cx="22"
              cy="22"
              r="18"
              className="stroke-accent transition-[stroke-dashoffset] duration-100 ease-out"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* 向上指示箭头 */}
          <svg
            className="size-4 stroke-current transition-transform duration-200 group-hover:-translate-y-0.5"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </>
  )
}
