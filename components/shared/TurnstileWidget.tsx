'use client'

import Script from 'next/script'

declare global {
  interface Window {
    turnstileToken?: string
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string
          callback?: (token: string) => void
          appearance?: string
          [key: string]: unknown
        },
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

export function TurnstileWidget() {
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

  function handleLoad() {
    if (typeof window === 'undefined' || !window.turnstile || !sitekey) return
    window.turnstile.render('#turnstile-widget', {
      sitekey,
      appearance: 'interaction-only',
      callback: (token: string) => {
        window.turnstileToken = token
      },
    })
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        onLoad={handleLoad}
      />
      <div id="turnstile-widget" />
    </>
  )
}
