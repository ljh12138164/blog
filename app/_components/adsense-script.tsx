'use client'

export function AdSenseScript() {
  return (
    <script
      data-cfasync="false"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7441827328189379"
      crossOrigin="anonymous"
      // An event handler prevents React from hoisting this ahead of consent defaults.
      onError={() => console.warn('AdSense script could not be loaded.')}
    />
  )
}
