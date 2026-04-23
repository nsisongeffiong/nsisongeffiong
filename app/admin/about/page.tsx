'use client'

// app/admin/about/page.tsx
import { useState, useEffect, useCallback } from 'react'
import AdminNav from '@/components/admin/AdminNav'

interface Book { title: string; author: string }
type BookList  = Record<string, Book[]>

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const QUARTER_LABELS: Record<number, string> = {
  1: 'Q1 (Jan–Mar)', 2: 'Q2 (Apr–Jun)',
  3: 'Q3 (Jul–Sep)', 4: 'Q4 (Oct–Dec)',
}
function currentQuarter() { return Math.ceil((new Date().getMonth() + 1) / 3) }

export default function AdminAboutPage() {
  const [nowItems,    setNowItems]    = useState<string[]>([])
  const [bookList,    setBookList]    = useState<BookList>({})
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth() + 1)
  const [newNowItem,  setNewNowItem]  = useState('')
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/about')
      .then(r => r.json())
      .then(d => { setNowItems(d.nowItems ?? []); setBookList(d.bookList ?? {}); setLoading(false) })
      .catch(() => { setError('Failed to load.'); setLoading(false) })
  }, [])

  const save = useCallback(async () => {
    setSaving(true)
    try {
      await fetch('/api/about', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nowItems, bookList }),
      })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch { setError('Save failed.') }
    finally { setSaving(false) }
  }, [nowItems, bookList])

  const addNowItem = () => {
    const t = newNowItem.trim(); if (!t) return
    setNowItems(p => [...p, t]); setNewNowItem('')
  }
  const removeNowItem  = (i: number) => setNowItems(p => p.filter((_, idx) => idx !== i))
  const moveNow = (i: number, dir: -1|1) => setNowItems(p => {
    const a = [...p]; [a[i], a[i+dir]] = [a[i+dir], a[i]]; return a
  })

  const getBooks  = (m: number): Book[] => bookList[String(m)] ?? []
  const setBooks  = (m: number, books: Book[]) =>
    setBookList(p => ({ ...p, [String(m)]: books }))
  const addBook   = (m: number) => setBooks(m, [...getBooks(m), { title: '', author: '' }])
  const updateBook = (m: number, i: number, f: keyof Book, v: string) => {
    const b = [...getBooks(m)]; b[i] = { ...b[i], [f]: v }; setBooks(m, b)
  }
  const removeBook = (m: number, i: number) =>
    setBooks(m, getBooks(m).filter((_, idx) => idx !== i))

  const mono: React.CSSProperties = {
    fontFamily: 'var(--font-dm-mono), monospace',
    fontSize: '11px', letterSpacing: '0.12em',
  }
  const inp: React.CSSProperties = {
    fontFamily: 'var(--font-source-serif), serif', fontSize: '14px',
    padding: '0.5rem 0.75rem', background: 'var(--bg2)',
    border: '0.5px solid var(--bdr2)', color: 'var(--txt)',
    width: '100%', outline: 'none', borderRadius: 0,
  }
  const btn: React.CSSProperties = {
    ...mono, padding: '0.45rem 1rem', background: 'none',
    border: '0.5px solid var(--bdr2)', color: 'var(--txt2)', cursor: 'pointer',
    borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px',
  }
  const btnA: React.CSSProperties = { ...btn, borderColor: 'var(--amber)', color: 'var(--amber)' }

  const cq = currentQuarter()

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminNav />
      <div style={{ marginLeft: 220, flex: 1, padding: '3rem 2rem', fontFamily: 'var(--font-dm-mono), monospace', fontSize: '12px', color: 'var(--txt3)' }}>Loading…</div>
    </div>
  )
  if (error) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminNav />
      <div style={{ marginLeft: 220, flex: 1, padding: '3rem 2rem', fontFamily: 'var(--font-dm-mono), monospace', fontSize: '12px', color: 'red' }}>{error}</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminNav />
      <div style={{ marginLeft: 220, flex: 1 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    marginBottom: '2.5rem', borderBottom: '0.5px solid var(--bdr)', paddingBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: 'var(--font-syne), sans-serif', fontSize: '22px',
                     fontWeight: 700, color: 'var(--txt)', margin: 0 }}>About page</h1>
        <button onClick={save} disabled={saving} style={{ ...btnA, fontSize: '11px', padding: '0.55rem 1.5rem' }}>
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>

      {/* NOW */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ ...mono, textTransform: 'uppercase', color: 'var(--amber)',
                      fontWeight: 600, marginBottom: '1.25rem', fontSize: '12px' }}>
          Now — what you&apos;re currently working on
        </div>
        <p style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '13px',
                    color: 'var(--txt3)', marginBottom: '1.25rem' }}>
          These appear as bullet items in the Now section. Use ↑ ↓ to reorder.
        </p>
        {nowItems.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button onClick={() => i > 0 && moveNow(i, -1)} style={btn} disabled={i === 0}>↑</button>
              <button onClick={() => i < nowItems.length - 1 && moveNow(i, 1)} style={btn} disabled={i === nowItems.length - 1}>↓</button>
            </div>
            <input value={item}
              onChange={e => setNowItems(p => { const a = [...p]; a[i] = e.target.value; return a })}
              style={{ ...inp, flex: 1 }} />
            <button onClick={() => removeNowItem(i)} style={{ ...btn, color: 'var(--txt3)' }}>✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <input value={newNowItem} onChange={e => setNewNowItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addNowItem()}
            placeholder="Add a new item…" style={{ ...inp, flex: 1 }} />
          <button onClick={addNowItem} style={btnA}>+ Add</button>
        </div>
      </section>

      {/* BOOK LIST */}
      <section>
        <div style={{ ...mono, textTransform: 'uppercase', color: 'var(--amber)',
                      fontWeight: 600, marginBottom: '0.5rem', fontSize: '12px' }}>
          Annual reading list
        </div>
        <p style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '13px',
                    color: 'var(--txt3)', marginBottom: '1.5rem' }}>
          Add books by month. The current quarter ({QUARTER_LABELS[cq]}) is shown on the About page.
        </p>

        {/* Quarter tabs */}
        <div style={{ display: 'flex', borderBottom: '0.5px solid var(--bdr)' }}>
          {[1,2,3,4].map(q => (
            <button key={q} onClick={() => setActiveMonth((q-1)*3+1)} style={{
              ...mono, padding: '0.6rem 1.25rem', background: 'none', border: 'none',
              borderBottom: Math.ceil(activeMonth/3) === q ? '2px solid var(--amber)' : '2px solid transparent',
              cursor: 'pointer', color: Math.ceil(activeMonth/3) === q ? 'var(--amber)' : 'var(--txt3)',
              fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '-0.5px',
            }}>{QUARTER_LABELS[q]}{q === cq ? ' ←' : ''}</button>
          ))}
        </div>

        {/* Month tabs */}
        <div style={{ display: 'flex', borderBottom: '0.5px solid var(--bdr)', marginBottom: '1.5rem' }}>
          {[1,2,3].map(offset => {
            const q = Math.ceil(activeMonth/3)
            const m = (q-1)*3+offset
            return (
              <button key={m} onClick={() => setActiveMonth(m)} style={{
                ...mono, padding: '0.5rem 1.25rem',
                background: activeMonth === m ? 'var(--bg2)' : 'none',
                border: 'none', cursor: 'pointer',
                color: activeMonth === m ? 'var(--txt)' : 'var(--txt3)',
                fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em',
                borderRight: '0.5px solid var(--bdr)',
              }}>{MONTHS[m-1]}</button>
            )
          })}
        </div>

        {/* Books */}
        <div style={{ background: 'var(--bg2)', padding: '1.5rem', border: '0.5px solid var(--bdr)' }}>
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
                        letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--txt3)',
                        display: 'block', marginBottom: '1rem' }}>
            {MONTHS[activeMonth-1]} — {getBooks(activeMonth).length} book{getBooks(activeMonth).length !== 1 ? 's' : ''}
          </div>
          {getBooks(activeMonth).map((book, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto',
                                  gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
              <input value={book.title} onChange={e => updateBook(activeMonth, i, 'title', e.target.value)}
                     placeholder="Title" style={inp} />
              <input value={book.author} onChange={e => updateBook(activeMonth, i, 'author', e.target.value)}
                     placeholder="Author" style={inp} />
              <button onClick={() => removeBook(activeMonth, i)} style={{ ...btn, color: 'var(--txt3)' }}>✕</button>
            </div>
          ))}
          {getBooks(activeMonth).length === 0 && (
            <p style={{ fontFamily: 'var(--font-source-serif), serif', fontStyle: 'italic',
                        fontSize: '13px', color: 'var(--txt3)', marginBottom: '1rem' }}>
              No books for {MONTHS[activeMonth-1]} yet.
            </p>
          )}
          <button onClick={() => addBook(activeMonth)} style={{ ...btnA, marginTop: '0.5rem' }}>
            + Add book
          </button>
        </div>
      </section>

      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem',
                    borderTop: '0.5px solid var(--bdr)', textAlign: 'right' }}>
        <button onClick={save} disabled={saving} style={{ ...btnA, fontSize: '11px', padding: '0.55rem 1.5rem' }}>
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>
    </div>
      </div>
    </div>
  )
}
