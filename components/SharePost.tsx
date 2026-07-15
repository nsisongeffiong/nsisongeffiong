'use client'

import { useEffect, useRef, useState } from 'react'

type Section = 'ideas' | 'tech' | 'poetry'

const ACCENT: Record<Section, string> = {
  ideas: 'var(--amber)',
  tech: 'var(--teal-mid)',
  poetry: 'var(--purple)',
}

export function SharePost({
  title,
  url,
  section,
}: {
  title: string
  url: string
  section: Section
}) {
  const accent = ACCENT[section]
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [])

  async function handleShare() {
    if (typeof navigator.share === 'function') {
      navigator.share({ title, url }).catch(() => {})
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable (permissions, insecure context) — leave label as-is
    }
  }

  return (
    <div style={{ borderTop: '0.5px solid var(--bdr)', paddingTop: '1.5rem' }}>
      <button
        type="button"
        onClick={handleShare}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '13px',
          color: hovered || copied ? accent : 'var(--txt3)',
          transition: 'color 0.15s ease',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        {copied ? 'Link copied' : 'Share this post ↗'}
      </button>
    </div>
  )
}
