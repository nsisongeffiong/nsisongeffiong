'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'

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
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (typeof navigator.share === 'function') setCanNativeShare(true)
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable (permissions, insecure context) — leave label as-is
    }
  }

  function handleNativeShare() {
    navigator.share({ title, url }).catch(() => {})
  }

  const actionStyle = (key: string): CSSProperties => ({
    fontFamily: 'var(--font-dm-mono), monospace',
    fontSize: '13px',
    color: hovered === key || (key === 'copy' && copied) ? accent : 'var(--txt3)',
    transition: 'color 0.15s ease',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
  })

  const hoverProps = (key: string) => ({
    onMouseEnter: () => setHovered(key),
    onMouseLeave: () => setHovered((h) => (h === key ? null : h)),
    onFocus: () => setHovered(key),
    onBlur: () => setHovered((h) => (h === key ? null : h)),
  })

  return (
    <div style={{
      borderTop: '0.5px solid var(--bdr)',
      paddingTop: '1.5rem',
      display: 'flex', alignItems: 'baseline', flexWrap: 'wrap',
      gap: '1.5rem',
    }}>
      <span style={{
        fontFamily: 'var(--font-inter-tight), var(--font-syne), sans-serif',
        fontSize: '11px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.22em',
        color: accent,
      }}>Share</span>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={actionStyle('x')}
        {...hoverProps('x')}
      >X</a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={actionStyle('linkedin')}
        {...hoverProps('linkedin')}
      >LinkedIn</a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={actionStyle('facebook')}
        {...hoverProps('facebook')}
      >Facebook</a>

      <button type="button" onClick={handleCopy} style={actionStyle('copy')} {...hoverProps('copy')}>
        {copied ? 'Copied' : 'Copy link'}
      </button>

      {canNativeShare && (
        <button type="button" onClick={handleNativeShare} style={actionStyle('native')} {...hoverProps('native')}>
          More
        </button>
      )}
    </div>
  )
}
