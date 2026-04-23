#!/usr/bin/env bash
# =============================================================================
# apply-about-feature.sh
#
# Applies the full About page feature to nsisongeffiong in one pass:
#   1. Adds aboutContent table to lib/db/schema.ts
#   2. Runs drizzle-kit push to create the DB table
#   3. Creates app/(public)/about/page.tsx
#   4. Creates app/admin/about/page.tsx
#   5. Creates app/api/about/route.ts
#   6. Patches SiteNav.tsx — adds /about to SECTION_LABELS
#   7. Patches @/types — adds About to NAV_LINKS
#   8. Patches AdminNav.tsx — adds About page link
#   9. Appends responsive CSS to globals.css
#
# Usage:
#   cd ~/ai-workspace/projects/nsisongeffiong
#   bash apply-about-feature.sh
#
# Requires: .env file present (for DATABASE_URL used by drizzle-kit)
# =============================================================================

set -euo pipefail
REPO="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
die()  { echo -e "${RED}✗${NC}  $1"; exit 1; }

echo ""
echo "════════════════════════════════════════════"
echo "  About page feature — applying all changes"
echo "════════════════════════════════════════════"
echo ""

# ── Sanity checks ─────────────────────────────────────────────────────────────
[[ -f "package.json" ]]        || die "Run this from the repo root (package.json not found)"
[[ -f ".env" ]]                || die ".env not found — DATABASE_URL needed for drizzle-kit push"
[[ -f "lib/db/schema.ts" ]]    || die "lib/db/schema.ts not found"
[[ -f "app/globals.css" ]]     || die "app/globals.css not found"

# ── 1. Patch lib/db/schema.ts ─────────────────────────────────────────────────
echo "── Step 1: Patching lib/db/schema.ts"

if grep -q "aboutContent" lib/db/schema.ts; then
  warn "aboutContent already in schema.ts — skipping"
else
  cat >> lib/db/schema.ts << 'SCHEMA_EOF'

// ── about_content ─────────────────────────────────────────────────────────────
// Single-row config table (id always = 1).
// nowItems  — JSON array of "Now" strings shown on the about page
// bookList  — JSON object keyed 1–12 (month), value = { title, author }[]
//             The about page filters to the current calendar quarter at render time.
export const aboutContent = pgTable('about_content', {
  id:        serial('id').primaryKey(),
  nowItems:  jsonb('now_items').$type<string[]>().notNull().default([]),
  bookList:  jsonb('book_list').$type<Record<string, { title: string; author: string }[]>>().notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type AboutContent = typeof aboutContent.$inferSelect
SCHEMA_EOF
  ok "schema.ts patched"
fi

# ── 2. Run drizzle-kit push ───────────────────────────────────────────────────
echo "── Step 2: Running drizzle-kit push"
npx --env-file=.env drizzle-kit push 2>&1 | tail -6
ok "drizzle-kit push complete"

# ── 3. Create app/(public)/about/page.tsx ────────────────────────────────────
echo "── Step 3: Creating app/(public)/about/page.tsx"
mkdir -p "app/(public)/about"

cat > "app/(public)/about/page.tsx" << 'ABOUT_EOF'
// app/(public)/about/page.tsx
export const dynamic = 'force-dynamic'

import { SiteNav }    from '@/components/shared/SiteNav'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { db }         from '@/lib/db'
import { aboutContent } from '@/lib/db/schema'

export const metadata = {
  title: 'About — Nsisong Effiong',
  description: 'Poet, engineer, and essayist based in Lagos.',
}

function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
  let result = ''
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i] }
  }
  return result
}
function getVolume(year: number) {
  return `Vol. ${toRoman(year - 2011 + 1)}`
}

function getCurrentQuarterBooks(
  bookList: Record<string, { title: string; author: string }[]>
): { title: string; author: string }[] {
  const month   = new Date().getMonth() + 1
  const quarter = Math.ceil(month / 3)
  const qMonths = [1, 2, 3].map(offset => String((quarter - 1) * 3 + offset))
  return qMonths.flatMap(m => bookList[m] ?? [])
}

export default async function AboutPage() {
  const rows  = await db.select().from(aboutContent).limit(1)
  const data  = rows[0]

  const nowItems     = data?.nowItems ?? []
  const bookList     = data?.bookList ?? {}
  const quarterBooks = getCurrentQuarterBooks(bookList)

  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const vol   = getVolume(year)

  return (
    <>
      <SiteNav />

      {/* Banner */}
      <div className="about-banner">
        <div>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--txt3)', display: 'block', marginBottom: '1rem',
          }}>About the author</span>
          <h1 style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 800,
            lineHeight: 0.88, letterSpacing: '-0.04em', color: 'var(--txt)',
          }}>Nsisong<br />Effiong</h1>
        </div>
        <div className="about-banner-tagline">
          <p style={{
            fontFamily: 'var(--font-source-serif), serif', fontSize: '14px',
            fontStyle: 'italic', fontWeight: 300, color: 'var(--txt2)',
            lineHeight: 1.75, marginBottom: '0.75rem',
          }}>
            Poet, engineer, and essayist based in Lagos. Writing at the intersection
            of language, technology, and public life.
          </p>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px',
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt3)',
          }}>Est. 2011</span>
        </div>
      </div>

      {/* 3-col editorial grid */}
      <div className="about-grid">

        {/* Col 1 — portrait + contact + dateline */}
        <div className="about-col about-col-border">
          <div style={{
            width: '100%', aspectRatio: '1 / 1', background: 'var(--bg3)',
            border: '0.5px solid var(--bdr2)', display: 'flex',
            flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '0.5rem',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                 stroke="var(--txt3)" strokeWidth="1">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt3)',
            }}>Portrait</span>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--txt3)',
              borderBottom: '0.5px solid var(--bdr)', paddingBottom: '0.5rem',
              marginBottom: '0.75rem',
            }}>Contact</div>
            {([
              ['Email',    'mailto:hello@nsisongeffiong.com',       'hello@nsisongeffiong.com'],
              ['GitHub',   'https://github.com/nsisongeffiong',     'github.com/nsisongeffiong'],
              ['Substack', 'https://nsisong.substack.com',          'nsisong.substack.com'],
              ['LinkedIn', 'https://linkedin.com/in/nsisongeffiong','linkedin.com/in/nsisongeffiong'],
            ] as const).map(([label, href, display]) => (
              <div key={label} style={{ padding: '0.6rem 0', borderBottom: '0.5px solid var(--bdr)' }}>
                <span style={{
                  fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
                  color: 'var(--txt3)', display: 'block', marginBottom: '0.15rem',
                }}>{label}</span>
                <a href={href} style={{
                  fontFamily: 'var(--font-syne), sans-serif', fontSize: '11px',
                  color: 'var(--amber)', textDecoration: 'none',
                }}>{display}</a>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '0.5px solid var(--bdr)' }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--txt3)', lineHeight: 1.9,
            }}>
              Lagos, Nigeria<br />{month}<br />{vol}
            </div>
          </div>
        </div>

        {/* Col 2 — biography */}
        <div className="about-col about-col-border">
          <div style={{
            fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--amber)', fontWeight: 600, marginBottom: '1.25rem',
          }}>Biography</div>

          <p style={{
            fontFamily: 'var(--font-source-serif), serif', fontSize: '15px',
            lineHeight: 1.9, color: 'var(--txt)', fontWeight: 300, marginBottom: '1.25rem',
          } as React.CSSProperties}>
            I grew up between the Niger Delta and Lagos, and the tension between those two
            places — between water and concrete, between patience and speed — has shaped
            everything I make.
          </p>
          <p style={{
            fontFamily: 'var(--font-source-serif), serif', fontSize: '14px',
            lineHeight: 1.9, color: 'var(--txt2)', fontWeight: 300, marginBottom: '1.25rem',
          } as React.CSSProperties}>
            I build AI systems by profession and write poetry and essays by compulsion.
            This site is where those two practices interrogate each other.
          </p>
          <p style={{
            fontFamily: 'var(--font-source-serif), serif', fontSize: '14px',
            lineHeight: 1.9, color: 'var(--txt2)', fontWeight: 300,
          } as React.CSSProperties}>
            I am interested in what technology distributes, who governance forgets,
            and why both questions sound different depending on where you&apos;re standing.
          </p>

          <div style={{ margin: '2rem 0', borderLeft: '2px solid var(--amber)', paddingLeft: '1.1rem' }}>
            <p style={{
              fontFamily: 'var(--font-syne), sans-serif', fontSize: '15px',
              fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.015em',
              color: 'var(--txt)', marginBottom: '0.5rem',
            }}>
              &ldquo;The poem wants to stay in the image. The essay wants to follow the argument.&rdquo;
            </p>
            <span style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--txt3)',
            }}>— on writing</span>
          </div>

          <div style={{ paddingTop: '1.5rem', borderTop: '0.5px solid var(--bdr)' }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--txt3)', marginBottom: '0.75rem',
            }}>Also published in</div>
            {['Straight Talk Nigeria', 'The Republic', 'Rest of World (contributor)'].map((p) => (
              <p key={p} style={{
                fontFamily: 'var(--font-source-serif), serif', fontStyle: 'italic',
                fontWeight: 300, fontSize: '13px', color: 'var(--txt2)', marginBottom: '0.35rem',
              }}>{p}</p>
            ))}
          </div>
        </div>

        {/* Col 3 — now + reading + roles */}
        <div className="about-col">
          <div style={{
            fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--amber)', fontWeight: 600, marginBottom: '1.25rem',
          }}>Now</div>

          {nowItems.length > 0 ? nowItems.map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: '0.75rem', marginBottom: '0.75rem',
              paddingBottom: '0.75rem', borderBottom: '0.5px solid var(--bdr)',
              alignItems: 'baseline',
            }}>
              <span style={{
                fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
                color: 'var(--amber)', flexShrink: 0,
              }}>→</span>
              <span style={{
                fontFamily: 'var(--font-source-serif), serif', fontSize: '13px',
                lineHeight: 1.65, color: 'var(--txt2)', fontWeight: 300,
              }}>{item}</span>
            </div>
          )) : (
            <p style={{
              fontFamily: 'var(--font-source-serif), serif', fontSize: '13px',
              color: 'var(--txt3)', fontStyle: 'italic',
            }}>Nothing here yet.</p>
          )}

          <div style={{ marginTop: '1.75rem' }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--txt3)', marginBottom: '0.85rem',
            }}>Reading</div>

            {quarterBooks.length > 0 ? quarterBooks.map(({ title, author }, i) => (
              <div key={title} style={{
                marginBottom: '0.75rem', paddingBottom: '0.75rem',
                borderBottom: i < quarterBooks.length - 1 ? '0.5px solid var(--bdr)' : 'none',
              }}>
                <p style={{
                  fontFamily: 'var(--font-source-serif), serif', fontStyle: 'italic',
                  fontWeight: 300, fontSize: '13px', color: 'var(--txt)', marginBottom: '0.15rem',
                }}>{title}</p>
                <span style={{
                  fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px', color: 'var(--txt3)',
                }}>{author}</span>
              </div>
            )) : (
              <p style={{
                fontFamily: 'var(--font-source-serif), serif', fontSize: '13px',
                color: 'var(--txt3)', fontStyle: 'italic',
              }}>No books listed for this quarter.</p>
            )}
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '0.5px solid var(--bdr)' }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--txt3)', marginBottom: '0.75rem',
            }}>Roles</div>
            {(['Poet', 'Engineer', 'Essayist'] as const).map((role, i) => (
              <p key={role} style={{
                fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic',
                fontWeight: 300, fontSize: '20px', lineHeight: 1.35,
                color: i === 0 ? 'var(--txt)' : 'var(--txt2)',
              }}>{role}</p>
            ))}
          </div>
        </div>

      </div>

      <SiteFooter />
    </>
  )
}
ABOUT_EOF
ok "app/(public)/about/page.tsx created"

# ── 4. Create app/admin/about/page.tsx ───────────────────────────────────────
echo "── Step 4: Creating app/admin/about/page.tsx"
mkdir -p "app/admin/about"

cat > "app/admin/about/page.tsx" << 'ADMIN_ABOUT_EOF'
'use client'

// app/admin/about/page.tsx
import { useState, useEffect, useCallback } from 'react'

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

  if (loading) return <div style={{ padding: '3rem 2rem', fontFamily: 'var(--font-dm-mono), monospace', fontSize: '12px', color: 'var(--txt3)' }}>Loading…</div>
  if (error)   return <div style={{ padding: '3rem 2rem', fontFamily: 'var(--font-dm-mono), monospace', fontSize: '12px', color: 'red' }}>{error}</div>

  return (
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
  )
}
ADMIN_ABOUT_EOF
ok "app/admin/about/page.tsx created"

# ── 5. Create app/api/about/route.ts ─────────────────────────────────────────
echo "── Step 5: Creating app/api/about/route.ts"
mkdir -p "app/api/about"

cat > "app/api/about/route.ts" << 'API_EOF'
// app/api/about/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db }             from '@/lib/db'
import { aboutContent }   from '@/lib/db/schema'
import { createServerClient } from '@/lib/supabase/server'
import { eq }             from 'drizzle-orm'

export async function GET() {
  const rows = await db.select().from(aboutContent).where(eq(aboutContent.id, 1)).limit(1)
  if (!rows[0]) return NextResponse.json({ nowItems: [], bookList: {} })
  return NextResponse.json({ nowItems: rows[0].nowItems, bookList: rows[0].bookList })
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  if (!adminEmails.includes(user.email ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { nowItems, bookList } = await req.json()
  const existing = await db.select({ id: aboutContent.id })
    .from(aboutContent).where(eq(aboutContent.id, 1)).limit(1)

  if (existing[0]) {
    await db.update(aboutContent)
      .set({ nowItems, bookList, updatedAt: new Date() })
      .where(eq(aboutContent.id, 1))
  } else {
    await db.insert(aboutContent).values({ id: 1, nowItems, bookList })
  }
  return NextResponse.json({ ok: true })
}
API_EOF
ok "app/api/about/route.ts created"

# ── 6. Patch SiteNav — add /about to SECTION_LABELS ─────────────────────────
echo "── Step 6: Patching components/shared/SiteNav.tsx (SECTION_LABELS)"

if grep -q "'/about'" components/shared/SiteNav.tsx; then
  warn "/about already in SiteNav SECTION_LABELS — skipping"
else
  # Insert after the /ideas line
  sed -i "s|'/ideas':  { label: '03 / Ideas',  color: 'var(--amber)'    },|'/ideas':  { label: '03 / Ideas',  color: 'var(--amber)'    },\n  '/about':  { label: 'About',       color: 'var(--txt2)'     },|" \
    components/shared/SiteNav.tsx
  ok "SiteNav.tsx patched"
fi

# ── 7. Patch @/types — add About to NAV_LINKS ────────────────────────────────
echo "── Step 7: Patching NAV_LINKS in types/"

# Find the file containing NAV_LINKS
TYPES_FILE=""
for f in types/index.ts types/index.tsx types.ts; do
  [[ -f "$f" ]] && TYPES_FILE="$f" && break
done

if [[ -z "$TYPES_FILE" ]]; then
  # Search more broadly
  TYPES_FILE=$(grep -rl "NAV_LINKS" --include="*.ts" --include="*.tsx" . \
    | grep -v node_modules | grep -v "SiteNav" | head -1)
fi

if [[ -z "$TYPES_FILE" ]]; then
  warn "Could not locate NAV_LINKS definition file — please add manually:"
  warn "  { href: '/about', label: 'About' }"
else
  if grep -q "'/about'" "$TYPES_FILE"; then
    warn "About already in NAV_LINKS ($TYPES_FILE) — skipping"
  else
    # Insert before the closing ] of the NAV_LINKS array
    # Works whether last entry has a trailing comma or not
    sed -i "s|{ href: '/ideas', label: 'Ideas' }|{ href: '/ideas', label: 'Ideas'  },\n  { href: '/about', label: 'About'  },|" "$TYPES_FILE"
    ok "NAV_LINKS patched in $TYPES_FILE"
  fi
fi

# ── 8. Patch AdminNav — add About page link ───────────────────────────────────
echo "── Step 8: Patching AdminNav"

ADMIN_NAV_FILE=$(grep -rl "admin/posts\|AdminNav" --include="*.ts" --include="*.tsx" . \
  | grep -v node_modules | grep "AdminNav\|admin/layout" | head -1)

if [[ -z "$ADMIN_NAV_FILE" ]]; then
  warn "Could not locate AdminNav file — please add '/admin/about' link manually"
else
  if grep -q "admin/about" "$ADMIN_NAV_FILE"; then
    warn "admin/about already in AdminNav — skipping"
  else
    # Add after the comments link — handles both href= and href='/admin/comments' patterns
    sed -i "s|admin/comments|admin/comments|;/admin\/comments/{
      /admin\/about/!{
        s|admin/comments.*$|&\n|
      }
    }" "$ADMIN_NAV_FILE" 2>/dev/null || true

    # Simpler fallback: append a warning comment if sed didn't find the hook
    if ! grep -q "admin/about" "$ADMIN_NAV_FILE"; then
      warn "Auto-patch of AdminNav inconclusive. Manually add this link to $ADMIN_NAV_FILE:"
      warn "  href='/admin/about'  label='About page'"
    else
      ok "AdminNav patched in $ADMIN_NAV_FILE"
    fi
  fi
fi

# ── 9. Append responsive CSS to globals.css ───────────────────────────────────
echo "── Step 9: Appending about CSS to app/globals.css"

if grep -q "about-banner" app/globals.css; then
  warn "about CSS already in globals.css — skipping"
else
  cat >> app/globals.css << 'CSS_EOF'

/* ─── About page layout ────────────────────────────────────────────────────── */

.about-banner {
  padding:               3rem 2rem 2rem;
  border-bottom:         2px solid var(--txt);
  display:               grid;
  grid-template-columns: 1fr auto;
  align-items:           flex-end;
  gap:                   2rem;
}
.about-banner-tagline {
  text-align:     right;
  max-width:      260px;
  padding-bottom: 0.25rem;
}

.about-grid {
  display:               grid;
  grid-template-columns: repeat(3, 1fr);
  border-bottom:         0.5px solid var(--bdr);
}
.about-col        { padding: 2.5rem 2rem; }
.about-col-border { border-right: 0.5px solid var(--bdr); }

@media (min-width: 769px) and (max-width: 1024px) {
  .about-grid { grid-template-columns: 1fr 1fr; }
  .about-grid > .about-col:nth-child(2) { border-right: none !important; }
  .about-grid > .about-col:nth-child(3) {
    grid-column:  1 / -1;
    border-right: none !important;
    border-top:   0.5px solid var(--bdr);
  }
}

@media (max-width: 768px) {
  .about-banner {
    grid-template-columns: 1fr;
    gap:                   1.5rem;
    padding:               2rem 1.25rem 1.5rem;
  }
  .about-banner-tagline { text-align: left; max-width: 100%; padding-bottom: 0; }
  .about-grid           { grid-template-columns: 1fr; }
  .about-col            { padding: 2rem 1.25rem; }
  .about-col-border     { border-right: none !important; border-bottom: 0.5px solid var(--bdr); }
}
CSS_EOF
  ok "globals.css updated"
fi

# ── 10. Git commit ────────────────────────────────────────────────────────────
echo "── Step 10: Committing"
git add -A
git commit -m "feat: about page — public page, admin editor, DB table, nav link

- Add aboutContent table to schema (nowItems + bookList JSONB)
- Run drizzle-kit push to create table
- app/(public)/about/page.tsx — editorial 3-col layout, dynamic dateline,
  DB-driven Now section, current-quarter reading list
- app/admin/about/page.tsx — Now item editor + monthly book list editor
- app/api/about/route.ts — GET (public) + POST (admin-auth) upsert
- SiteNav: add /about to SECTION_LABELS
- NAV_LINKS: add About entry
- globals.css: about-banner + about-grid responsive classes
- Fix: Straight Talk Nigeria spelling
- Fix: dynamic Vol. XVI dateline via toRoman helper"

ok "Committed"

echo ""
echo "════════════════════════════════════════════"
echo "  Done. Push to deploy:"
echo "  git push"
echo "════════════════════════════════════════════"
echo ""
