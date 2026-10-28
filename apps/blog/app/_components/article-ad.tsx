'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { isAdSlot } from '@/lib/adsense'
import config from '@/site.config.json'

const client = 'ca-pub-7441827328189379'

export function ArticleAd() {
  const slot = config.articleAdSlot
  if (!isAdSlot(slot)) return null
  return <ManualAd slot={slot} />
}

function ManualAd({ slot }: { slot: string }) {
  const element = useRef<HTMLModElement>(null)
  const requested = useRef(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const ad = element.current
    if (!ready || !ad) return
    const request = () => {
      if (requested.current || !ad.isConnected || ad.getBoundingClientRect().width === 0) return
      if (ad.dataset.adsbygoogleStatus) return
      requested.current = true
      try {
        const adsWindow = window as typeof window & { adsbygoogle?: object[] }
        adsWindow.adsbygoogle ||= []
        adsWindow.adsbygoogle.push({})
      } catch (error) {
        console.error('AdSense manual ad could not initialize', error)
      }
    }
    request()
    const observer = new ResizeObserver(request)
    observer.observe(ad)
    return () => observer.disconnect()
  }, [ready])

  return (
    <aside className="not-prose my-12" aria-label="广告" data-pagefind-ignore>
      <p className="mb-2 text-center text-xs text-muted">广告</p>
      <ins
        ref={element}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script
        id="google-adsense-manual"
        data-cfasync="false"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
    </aside>
  )
}
