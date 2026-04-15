'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      let data: { success?: boolean; error?: string } = {}
      try {
        data = await res.json()
      } catch {
        setError('Authentication failed')
        return
      }

      if (res.ok && data.success === true) {
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg2)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--bg)',
          border: '0.5px solid var(--bdr)',
          borderRadius: '4px',
          padding: '2.5rem',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: '20px',
            fontStyle: 'italic',
            color: 'var(--txt)',
            textDecoration: 'none',
            display: 'block',
            textAlign: 'center',
            marginBottom: '0.5rem',
          }}
        >
          nsisongeffiong.com
        </a>

        <span
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--txt3)',
            display: 'block',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          Admin
        </span>

        <hr
          style={{
            width: '100%',
            height: '0.5px',
            background: 'var(--bdr)',
            marginBottom: '1.5rem',
            border: 'none',
          }}
        />

        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="email"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--txt3)',
              display: 'block',
              marginBottom: '0.4rem',
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '13px',
              padding: '0.6rem 0.75rem',
              border: '0.5px solid var(--bdr2)',
              borderRadius: '3px',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="password"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--txt3)',
              display: 'block',
              marginBottom: '0.4rem',
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '13px',
              padding: '0.6rem 0.75rem',
              border: '0.5px solid var(--bdr2)',
              borderRadius: '3px',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '11px',
              color: 'var(--danger)',
              marginBottom: '1rem',
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            background: 'var(--teal-hero)',
            color: 'var(--teal-light)',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '3px',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
