'use client'

import { useEffect } from 'react'

interface DisqusCommentsProps {
  slug:  string
  title: string
}

export function DisqusComments({ slug, title }: DisqusCommentsProps) {
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nsisongeffiong.com'
  const shortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME ?? 'nsisongeffiong'

  useEffect(() => {
    const win = window as any
    win.disqus_config = function () {
      this.page.url        = `${siteUrl}/${slug}/`
      this.page.identifier = slug
      this.page.title      = title
    }

    const script    = document.createElement('script')
    script.src      = `https://${shortname}.disqus.com/embed.js`
    script.async    = true
    script.setAttribute('data-timestamp', String(+new Date()))
    document.body.appendChild(script)

    return () => {
      // Clean up the embed when navigating away
      document.body.removeChild(script)
      const thread = document.getElementById('disqus_thread')
      if (thread) thread.innerHTML = ''
      delete win.DISQUS
    }
  }, [slug, title, siteUrl, shortname])

  return (
    <div style={{ padding: '2.5rem 2rem' }}>
      <div
        style={{
          width:        '100%',
          height:       '0.5px',
          background:   'var(--bdr)',
          marginBottom: '2rem',
        }}
      />
      <div
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           '0.75rem',
          marginBottom:  '1.5rem',
        }}
      >
        <span
          style={{
            fontFamily:    'var(--font-cormorant), serif',
            fontSize:      '12px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color:         'var(--txt3)',
          }}
        >
          Responses
        </span>
        <span
          style={{
            fontFamily:  'var(--font-dm-mono), monospace',
            fontSize:    '9px',
            padding:     '2px 7px',
            background:  'var(--purple-bg)',
            color:       'var(--purple-txt)',
            borderRadius:'2px',
            letterSpacing:'0.08em',
          }}
        >
          via Disqus
        </span>
      </div>
      <div id="disqus_thread" />
    </div>
  )
}
