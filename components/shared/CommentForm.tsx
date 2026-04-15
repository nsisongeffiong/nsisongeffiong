'use client'

import { useState, useRef } from 'react'

interface CommentFormProps {
  postId:   string
  parentId?: string | null
  section:  'poetry' | 'tech' | 'ideas'
  onSuccess?: () => void
  onCancel?:  () => void
}

export function CommentForm({
  postId,
  parentId,
  section,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [body,     setBody]     = useState('')
  const [status,   setStatus]   = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const honeypotRef = useRef<HTMLInputElement>(null)

  const isPoetry = section === 'poetry'
  const isTech   = section === 'tech'
  const isIdeas  = section === 'ideas'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      // Get Turnstile token — widget renders via script in page
      const turnstileToken = (window as any).turnstileToken ?? ''

      if (!turnstileToken) {
        setStatus('error')
        setErrorMsg('Verification is not ready yet. Please try again later.')
        return
      }

      const res = await fetch('/api/comments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          parentId:       parentId ?? null,
          authorName:     name.trim(),
          authorEmail:    email.trim(),
          bodyText:       body.trim(),
          website:        honeypotRef.current?.value ?? '', // honeypot
          turnstileToken,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setStatus('error')
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      setStatus('success')
      setName('')
      setEmail('')
      setBody('')
      onSuccess?.()
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please check your connection and try again.')
    }
  }

  if (status === 'success') {
    return (
      <p style={{
        fontFamily:  isPoetry ? 'var(--font-cormorant), serif' : isIdeas ? 'var(--font-source-serif), serif' : 'var(--font-dm-mono), monospace',
        fontSize:    isPoetry ? '15px' : '13px',
        fontStyle:   isPoetry || isIdeas ? 'italic' : 'normal',
        color:       'var(--txt2)',
        textAlign:   isPoetry || isIdeas ? 'center' : 'left',
        padding:     '1rem 0',
      }}>
        {isPoetry || isIdeas
          ? 'Your response has been submitted and will appear after moderation. Thank you.'
          : '// comment submitted. it will appear after moderation.'}
      </p>
    )
  }

  const labelStyle: React.CSSProperties = {
    fontFamily:    isPoetry
                     ? 'var(--font-cormorant), serif'
                     : isIdeas
                       ? 'var(--font-syne), sans-serif'
                       : 'var(--font-dm-mono), monospace',
    fontSize:      '10px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color:         'var(--txt3)',
    display:       'block',
    marginBottom:  '0.35rem',
    fontWeight:    isIdeas ? 600 : 400,
  }

  const inputStyle: React.CSSProperties = isPoetry || isIdeas ? {
    fontFamily:    isPoetry ? 'var(--font-cormorant), serif' : 'var(--font-source-serif), serif',
    fontSize:      '15px',
    fontStyle:     'italic',
    padding:       '0.6rem 0',
    border:        'none',
    borderBottom:  '0.5px solid var(--bdr2)',
    background:    'transparent',
    color:         'var(--txt)',
    outline:       'none',
    width:         '100%',
  } : {
    fontFamily:   'var(--font-dm-mono), monospace',
    fontSize:     '12px',
    padding:      '0.5rem 0.75rem',
    border:       '0.5px solid var(--bdr2)',
    borderRadius: '3px',
    background:   'var(--bg2)',
    color:        'var(--txt)',
    outline:      'none',
    width:        '100%',
  }

  const submitStyle: React.CSSProperties = isPoetry ? {
    fontFamily:    'var(--font-cormorant), serif',
    fontSize:      '12px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color:         'var(--purple)',
    background:    'none',
    border:        '0.5px solid var(--purple-acc)',
    padding:       '0.65rem 2rem',
    cursor:        'pointer',
    display:       'block',
    margin:        '0 auto',
  } : isIdeas ? {
    fontFamily:    'var(--font-syne), sans-serif',
    fontSize:      '11px',
    fontWeight:    700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    background:    'none',
    border:        '0.5px solid var(--amber)',
    color:         'var(--amber)',
    padding:       '0.7rem 2rem',
    cursor:        'pointer',
  } : {
    fontFamily:    'var(--font-dm-mono), monospace',
    fontSize:      '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    background:    'var(--teal-hero)',
    color:         'var(--teal-light)',
    border:        'none',
    padding:       '0.6rem 1.5rem',
    cursor:        'pointer',
    borderRadius:  '3px',
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Honeypot — hidden from real users, visible to bots */}
      <input
        ref={honeypotRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isPoetry || isIdeas ? 'Your name' : 'your name'}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isPoetry || isIdeas ? 'your@email.com' : 'your@email.com'}
            required
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>
          {isTech ? 'Comment' : 'Response'}
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            isPoetry ? 'Write something...'
            : isTech  ? 'your comment...'
            :            'Your response...'
          }
          required
          rows={4}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
        />
      </div>

      {errorMsg && (
        <p style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize:   '12px',
          color:      'var(--danger)',
          marginBottom: '1rem',
        }}>
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        style={{
          ...submitStyle,
          opacity: status === 'submitting' ? 0.6 : 1,
        }}
      >
        {status === 'submitting'
          ? (isTech ? '$ submitting...' : 'Submitting...')
          : (isTech ? '$ submit' : isPoetry ? 'Submit' : 'Submit response')}
      </button>

      <p style={{
        fontFamily: isPoetry
          ? 'var(--font-cormorant), serif'
          : isIdeas
            ? 'var(--font-source-serif), serif'
            : 'var(--font-dm-mono), monospace',
        fontSize:    isPoetry || isIdeas ? '12px' : '10px',
        fontStyle:   isPoetry || isIdeas ? 'italic' : 'normal',
        color:       'var(--txt3)',
        textAlign:   isPoetry ? 'center' : 'left',
        marginTop:   '0.85rem',
        letterSpacing: isTech ? '0.06em' : 'normal',
      }}>
        {isTech
          ? 'email hidden publicly · comments moderated before publishing'
          : isIdeas
            ? 'Your email is never displayed publicly. All responses are moderated.'
            : 'Your email is never displayed publicly · Comments are moderated'}
      </p>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'none',
            border:     'none',
            color:      'var(--txt3)',
            cursor:     'pointer',
            fontSize:   '12px',
            marginTop:  '0.5rem',
          }}
        >
          Cancel
        </button>
      )}
    </form>
  )
}
