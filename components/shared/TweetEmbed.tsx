'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement | null) => void
      }
    }
  }
}

type Props = {
  url: string
  fallback?: string
}

export function TweetEmbed({ url, fallback }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  function renderWidget() {
    if (typeof window === 'undefined') return
    window.twttr?.widgets.load(ref.current)
  }

  // Handles client-side navigation and the case where widgets.js is already
  // loaded (so the Script onLoad won't fire again for this mount).
  useEffect(() => {
    renderWidget()
  }, [url])

  return (
    <div
      ref={ref}
      style={{
        margin: '2.5rem 0',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <blockquote
        className="twitter-tweet"
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          border: '0.5px solid var(--bdr2)',
          color: 'var(--teal-mid)',
        }}
      >
        <a href={url}>{fallback ?? url}</a>
      </blockquote>
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onLoad={renderWidget}
      />
    </div>
  )
}
