'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminNav from '@/components/admin/AdminNav'

interface Book { title: string; author: string }
type BookList = Record<string, Book[]>
type Section = 'poetry' | 'tech' | 'ideas'
interface Topic {
  id: string; label: string; slug: string; section: Section
  description: string | null; position: string; tags: string[]
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const QUARTER_LABELS: Record<number, string> = { 1:'Q1 (Jan–Mar)', 2:'Q2 (Apr–Jun)', 3:'Q3 (Jul–Sep)', 4:'Q4 (Oct–Dec)' }
const SECTIONS: Section[] = ['poetry', 'tech', 'ideas']
const SECTION_LABELS: Record<Section, string> = { poetry: 'Poetry', tech: 'Tech', ideas: 'Ideas' }
function currentQuarter() { return Math.ceil((new Date().getMonth() + 1) / 3) }

const mono: React.CSSProperties = { fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', letterSpacing: '0.12em' }
const inp: React.CSSProperties = { fontFamily: 'var(--font-source-serif), serif', fontSize: '14px', padding: '0.5rem 0.75rem', background: 'var(--bg2)', border: '0.5px solid var(--bdr2)', color: 'var(--txt)', width: '100%', outline: 'none', borderRadius: 0 }
const btn: React.CSSProperties = { ...mono, padding: '0.45rem 1rem', background: 'none', border: '0.5px solid var(--bdr2)', color: 'var(--txt2)', cursor: 'pointer', borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }
const btnA: React.CSSProperties = { ...btn, borderColor: 'var(--amber)', color: 'var(--amber)' }
const btnD: React.CSSProperties = { ...btn, borderColor: 'var(--danger)', color: 'var(--danger)' }
const secLabel: React.CSSProperties = { ...mono, textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 600, marginBottom: '1.25rem', fontSize: '12px' }

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'about' | 'topics'>('about')
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminNav />
      <div style={{ marginLeft: 220, flex: 1 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-syne), sans-serif', fontSize: '22px', fontWeight: 700, color: 'var(--txt)', margin: 0, marginBottom: '1.75rem' }}>Site settings</h1>
          <div style={{ display: 'flex', borderBottom: '0.5px solid var(--bdr)', marginBottom: '2.5rem' }}>
            {(['about', 'topics'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...mono, padding: '0.65rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--teal-mid)' : '2px solid transparent', color: activeTab === tab ? 'var(--teal-mid)' : 'var(--txt3)', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '-0.5px' }}>
                {tab === 'about' ? 'About page' : 'Topics'}
              </button>
            ))}
          </div>
          {activeTab === 'about' ? <AboutSection /> : <TopicsSection />}
        </div>
      </div>
    </div>
  )
}

function AboutSection() {
  const [nowItems,    setNowItems]    = useState<string[]>([])
  const [bookList,    setBookList]    = useState<BookList>({})
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth() + 1)
  const [newNowItem,  setNewNowItem]  = useState('')
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/about').then(r => r.json()).then(d => { setNowItems(d.nowItems ?? []); setBookList(d.bookList ?? {}); setLoading(false) }).catch(() => { setError('Failed to load.'); setLoading(false) })
  }, [])

  const save = useCallback(async () => {
    setSaving(true)
    try { await fetch('/api/about', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nowItems, bookList }) }); setSaved(true); setTimeout(() => setSaved(false), 2500) }
    catch { setError('Save failed.') } finally { setSaving(false) }
  }, [nowItems, bookList])

  const addNowItem    = () => { const t = newNowItem.trim(); if (!t) return; setNowItems(p => [...p, t]); setNewNowItem('') }
  const removeNowItem = (i: number) => setNowItems(p => p.filter((_, idx) => idx !== i))
  const moveNow       = (i: number, dir: -1|1) => setNowItems(p => { const a = [...p]; [a[i], a[i+dir]] = [a[i+dir], a[i]]; return a })
  const getBooks      = (m: number): Book[] => bookList[String(m)] ?? []
  const setBooks      = (m: number, books: Book[]) => setBookList(p => ({ ...p, [String(m)]: books }))
  const addBook       = (m: number) => setBooks(m, [...getBooks(m), { title: '', author: '' }])
  const updateBook    = (m: number, i: number, f: keyof Book, v: string) => { const b = [...getBooks(m)]; b[i] = { ...b[i], [f]: v }; setBooks(m, b) }
  const removeBook    = (m: number, i: number) => setBooks(m, getBooks(m).filter((_, idx) => idx !== i))
  const cq = currentQuarter()

  if (loading) return <div style={{ ...mono, color: 'var(--txt3)' }}>Loading…</div>
  if (error)   return <div style={{ ...mono, color: 'var(--danger)' }}>{error}</div>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <button onClick={save} disabled={saving} style={{ ...btnA, fontSize: '11px', padding: '0.55rem 1.5rem' }}>{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}</button>
      </div>

      <section style={{ marginBottom: '3rem' }}>
        <div style={secLabel}>Now — what you&apos;re currently working on</div>
        <p style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '13px', color: 'var(--txt3)', marginBottom: '1.25rem' }}>These appear as bullet items in the Now section. Use ↑ ↓ to reorder.</p>
        {nowItems.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button onClick={() => i > 0 && moveNow(i, -1)} style={btn} disabled={i === 0}>↑</button>
              <button onClick={() => i < nowItems.length - 1 && moveNow(i, 1)} style={btn} disabled={i === nowItems.length - 1}>↓</button>
            </div>
            <input value={item} onChange={e => setNowItems(p => { const a = [...p]; a[i] = e.target.value; return a })} style={{ ...inp, flex: 1 }} />
            <button onClick={() => removeNowItem(i)} style={{ ...btn, color: 'var(--txt3)' }}>✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <input value={newNowItem} onChange={e => setNewNowItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNowItem()} placeholder="Add a new item…" style={{ ...inp, flex: 1 }} />
          <button onClick={addNowItem} style={btnA}>+ Add</button>
        </div>
      </section>

      <section>
        <div style={secLabel}>Annual reading list</div>
        <p style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '13px', color: 'var(--txt3)', marginBottom: '1.5rem' }}>Add books by month. The current quarter ({QUARTER_LABELS[cq]}) is shown on the About page.</p>
        <div style={{ display: 'flex', borderBottom: '0.5px solid var(--bdr)' }}>
          {[1,2,3,4].map(q => (
            <button key={q} onClick={() => setActiveMonth((q-1)*3+1)} style={{ ...mono, padding: '0.6rem 1.25rem', background: 'none', border: 'none', borderBottom: Math.ceil(activeMonth/3) === q ? '2px solid var(--amber)' : '2px solid transparent', cursor: 'pointer', color: Math.ceil(activeMonth/3) === q ? 'var(--amber)' : 'var(--txt3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '-0.5px' }}>{QUARTER_LABELS[q]}{q === cq ? ' ←' : ''}</button>
          ))}
        </div>
        <div style={{ display: 'flex', borderBottom: '0.5px solid var(--bdr)', marginBottom: '1.5rem' }}>
          {[1,2,3].map(offset => { const q = Math.ceil(activeMonth/3); const m = (q-1)*3+offset; return (
            <button key={m} onClick={() => setActiveMonth(m)} style={{ ...mono, padding: '0.5rem 1.25rem', background: activeMonth === m ? 'var(--bg2)' : 'none', border: 'none', cursor: 'pointer', color: activeMonth === m ? 'var(--txt)' : 'var(--txt3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', borderRight: '0.5px solid var(--bdr)' }}>{MONTHS[m-1]}</button>
          )})}
        </div>
        <div style={{ background: 'var(--bg2)', padding: '1.5rem', border: '0.5px solid var(--bdr)' }}>
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--txt3)', display: 'block', marginBottom: '1rem' }}>{MONTHS[activeMonth-1]} — {getBooks(activeMonth).length} book{getBooks(activeMonth).length !== 1 ? 's' : ''}</div>
          {getBooks(activeMonth).map((book, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
              <input value={book.title} onChange={e => updateBook(activeMonth, i, 'title', e.target.value)} placeholder="Title" style={inp} />
              <input value={book.author} onChange={e => updateBook(activeMonth, i, 'author', e.target.value)} placeholder="Author" style={inp} />
              <button onClick={() => removeBook(activeMonth, i)} style={{ ...btn, color: 'var(--txt3)' }}>✕</button>
            </div>
          ))}
          {getBooks(activeMonth).length === 0 && <p style={{ fontFamily: 'var(--font-source-serif), serif', fontStyle: 'italic', fontSize: '13px', color: 'var(--txt3)', marginBottom: '1rem' }}>No books for {MONTHS[activeMonth-1]} yet.</p>}
          <button onClick={() => addBook(activeMonth)} style={{ ...btnA, marginTop: '0.5rem' }}>+ Add book</button>
        </div>
      </section>

      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '0.5px solid var(--bdr)', textAlign: 'right' }}>
        <button onClick={save} disabled={saving} style={{ ...btnA, fontSize: '11px', padding: '0.55rem 1.5rem' }}>{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}</button>
      </div>
    </>
  )
}

function TopicsSection() {
  const [topics,        setTopics]        = useState<Topic[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<Section>('tech')
  const [newLabel,      setNewLabel]      = useState('')
  const [newDesc,       setNewDesc]       = useState('')
  const [creating,      setCreating]      = useState(false)
  const [tagInputs,     setTagInputs]     = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try { const res = await fetch('/api/admin/topics', { credentials: 'include' }); setTopics(await res.json()) }
    catch { setError('Failed to load topics.') } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const sectionTopics = topics.filter(t => t.section === activeSection).sort((a, b) => Number(a.position) - Number(b.position))

  const createTopic = async () => {
    if (!newLabel.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/topics', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: newLabel.trim(), section: activeSection, description: newDesc.trim() || null }) })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to create'); return }
      setNewLabel(''); setNewDesc(''); await load()
    } catch { setError('Failed to create topic.') } finally { setCreating(false) }
  }

  const deleteTopic = async (id: string) => {
    if (!confirm('Delete this topic? This will remove all tag and post assignments.')) return
    try { await fetch(`/api/admin/topics/${id}`, { method: 'DELETE', credentials: 'include' }); await load() }
    catch { setError('Failed to delete topic.') }
  }

  const moveTopic = async (id: string, dir: -1|1) => {
    const list = [...sectionTopics]; const idx = list.findIndex(t => t.id === id); if (idx < 0) return
    const swapIdx = idx + dir; if (swapIdx < 0 || swapIdx >= list.length) return
    ;[list[idx], list[swapIdx]] = [list[swapIdx], list[idx]]
    const order = list.map((t, i) => ({ id: t.id, position: i + 1 }))
    try { await fetch('/api/admin/topics/reorder', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order }) }); await load() }
    catch { setError('Failed to reorder.') }
  }

  const addTag = async (topicId: string) => {
    const tag = (tagInputs[topicId] ?? '').trim().toLowerCase(); if (!tag) return
    try { await fetch(`/api/admin/topics/${topicId}/tags`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tag }) }); setTagInputs(p => ({ ...p, [topicId]: '' })); await load() }
    catch { setError('Failed to add tag.') }
  }

  const removeTag = async (topicId: string, tag: string) => {
    try { await fetch(`/api/admin/topics/${topicId}/tags/${encodeURIComponent(tag)}`, { method: 'DELETE', credentials: 'include' }); await load() }
    catch { setError('Failed to remove tag.') }
  }

  if (loading) return <div style={{ ...mono, color: 'var(--txt3)' }}>Loading…</div>

  return (
    <>
      {error && <div style={{ ...mono, color: 'var(--danger)', marginBottom: '1rem' }}>{error} <button onClick={() => setError(null)} style={{ ...btn, marginLeft: '0.5rem' }}>Dismiss</button></div>}

      <p style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '13px', color: 'var(--txt3)', marginBottom: '2rem' }}>
        Topics group post tags into filter chips on each section page. A tag can belong to multiple topics. Changes take effect immediately.
      </p>

      {/* Section tabs */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid var(--bdr)', marginBottom: '2rem' }}>
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setActiveSection(s)} style={{ ...mono, padding: '0.65rem 1.5rem', background: 'none', border: 'none', borderBottom: activeSection === s ? '2px solid var(--teal-mid)' : '2px solid transparent', color: activeSection === s ? 'var(--teal-mid)' : 'var(--txt3)', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '-0.5px' }}>{SECTION_LABELS[s]}</button>
        ))}
      </div>

      {sectionTopics.length === 0 && <p style={{ fontFamily: 'var(--font-source-serif), serif', fontStyle: 'italic', fontSize: '13px', color: 'var(--txt3)', marginBottom: '2rem' }}>No topics yet for {SECTION_LABELS[activeSection]}.</p>}

      {sectionTopics.map((topic, idx) => (
        <div key={topic.id} style={{ border: '0.5px solid var(--bdr)', marginBottom: '1rem', background: 'var(--bg2)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', borderBottom: '0.5px solid var(--bdr)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button onClick={() => moveTopic(topic.id, -1)} disabled={idx === 0} style={{ ...btn, padding: '2px 6px' }}>↑</button>
              <button onClick={() => moveTopic(topic.id, 1)} disabled={idx === sectionTopics.length - 1} style={{ ...btn, padding: '2px 6px' }}>↓</button>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: 'var(--font-syne), sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--txt)' }}>{topic.label}</span>
              {topic.description && <span style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '12px', color: 'var(--txt3)', marginLeft: '0.75rem' }}>{topic.description}</span>}
            </div>
            <button onClick={() => deleteTopic(topic.id)} style={{ ...btnD, padding: '0.3rem 0.75rem', fontSize: '10px' }}>Delete</button>
          </div>
          {/* Tags */}
          <div style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {topic.tags.length === 0 && <span style={{ ...mono, color: 'var(--txt3)', fontSize: '11px' }}>No tags yet</span>}
              {topic.tags.map(tag => (
                <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px', padding: '3px 8px', border: '0.5px solid var(--bdr2)', background: 'var(--bg)', color: 'var(--txt2)' }}>
                  {tag}
                  <button onClick={() => removeTag(topic.id, tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt3)', fontSize: '10px', padding: 0, lineHeight: 1 }}>✕</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input value={tagInputs[topic.id] ?? ''} onChange={e => setTagInputs(p => ({ ...p, [topic.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addTag(topic.id)} placeholder="Add tag… (lowercase, e.g. ai & society)" style={{ ...inp, flex: 1, fontSize: '12px', padding: '0.35rem 0.6rem' }} />
              <button onClick={() => addTag(topic.id)} style={btnA}>+ Add</button>
            </div>
          </div>
        </div>
      ))}

      {/* Create new topic */}
      <div style={{ marginTop: '2rem', padding: '1.25rem', border: '0.5px solid var(--bdr)' }}>
        <div style={{ ...secLabel, marginBottom: '1rem' }}>New topic — {SECTION_LABELS[activeSection]}</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && createTopic()} placeholder="Label (e.g. Machine Learning)" style={{ ...inp, flex: 2 }} />
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" style={{ ...inp, flex: 3 }} />
          <button onClick={createTopic} disabled={creating || !newLabel.trim()} style={{ ...btnA, whiteSpace: 'nowrap' }}>{creating ? 'Creating…' : '+ Create'}</button>
        </div>
        <p style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '12px', color: 'var(--txt3)', marginTop: '0.5rem' }}>After creating, add tags above. Tags must match post tag values exactly — use lowercase.</p>
      </div>
    </>
  )
}
