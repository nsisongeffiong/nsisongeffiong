'use client'

import { useEffect } from 'react'

interface DisqusCommentsProps {
  slug:  string
  title: string
  path:  string  // full canonical path e.g. /poetry/the-plea
}

export function DisqusComments({ slug, title, path }: DisqusCommentsProps) {
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nsisongeffiong.com'
  const shortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME ?? 'nsisongeffiong'

  useEffect(() => {
    const win = window as any

    const config = function (this: any) {
      this.page.url        = `${siteUrl}${path}`
      this.page.identifier = slug
      this.page.title      = title
    }

    win.disqus_config = config

    // If DISQUS is already loaded (e.g. navigating between posts),
    // call reset instead of appending a new script
    if (win.DISQUS) {
      win.DISQUS.reset({
        reload: true,
        config,
      })
      return
    }

    const script    = document.createElement('script')
    script.src      = `https://${shortname}.disqus.com/embed.js`
    script.async    = true
    script.setAttribute('data-timestamp', String(+new Date()))
    document.body.appendChild(script)

    return () => {
      // Clean up the embed when navigating away
      const thread = document.getElementById('disqus_thread')
      if (thread) thread.innerHTML = ''
    }
  }, [slug, title, path, siteUrl, shortname])

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
