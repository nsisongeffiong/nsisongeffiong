import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

// Read from disk, never fetch — the Docker build has no network guarantee,
// and a failed fetch silently degrades to Noto Sans.
const fontDir = join(process.cwd(), 'public', 'fonts', 'og')
const interTight800 = readFileSync(join(fontDir, 'inter-tight-800.ttf'))
const frauncesItalic400 = readFileSync(join(fontDir, 'fraunces-italic-400.ttf'))
const jetbrainsMono400 = readFileSync(join(fontDir, 'jetbrains-mono-400.ttf'))
const jetbrainsMono500 = readFileSync(join(fontDir, 'jetbrains-mono-500.ttf'))
const sourceSerifItalic300 = readFileSync(join(fontDir, 'source-serif-4-italic-300.ttf'))

const fonts = [
  { name: 'Inter Tight', data: interTight800, weight: 800 as const, style: 'normal' as const },
  { name: 'Fraunces', data: frauncesItalic400, weight: 400 as const, style: 'italic' as const },
  { name: 'JetBrains Mono', data: jetbrainsMono400, weight: 400 as const, style: 'normal' as const },
  { name: 'JetBrains Mono', data: jetbrainsMono500, weight: 500 as const, style: 'normal' as const },
  { name: 'Source Serif 4', data: sourceSerifItalic300, weight: 300 as const, style: 'italic' as const },
]

const INK = '#1A1A17'
const HAIRLINE = 'rgba(26,26,23,0.10)'

export type OgSection = 'poetry' | 'tech' | 'ideas'

const SECTIONS: Record<
  OgSection,
  {
    marker: string
    tagline: string
    accent: string
    title: { fontFamily: string; fontWeight: number; fontStyle: 'normal' | 'italic'; baseSize: number }
  }
> = {
  poetry: {
    marker: '01 / POETRY',
    tagline: 'THE LITERARY SPACE',
    accent: '#514279',
    title: { fontFamily: 'Fraunces', fontWeight: 400, fontStyle: 'italic', baseSize: 58 },
  },
  tech: {
    marker: '02 / TECH',
    tagline: 'ENGINEERING NOTES',
    accent: '#014F3C',
    title: { fontFamily: 'JetBrains Mono', fontWeight: 500, fontStyle: 'normal', baseSize: 44 },
  },
  ideas: {
    marker: '03 / IDEAS',
    tagline: 'ESSAYS & CULTURE',
    accent: '#965719',
    title: { fontFamily: 'Inter Tight', fontWeight: 800, fontStyle: 'normal', baseSize: 56 },
  },
}

// Deterministic per-slug seed: same slug always renders the same accent rule.
function hashSlug(slug: string): number {
  let h = 5381
  for (let i = 0; i < slug.length; i++) {
    h = ((h * 33) ^ slug.charCodeAt(i)) >>> 0
  }
  return h
}

export async function renderPostOgImage(section: OgSection, slug: string) {
  const s = SECTIONS[section]
  const [post] = await db
    .select({ title: posts.title, excerpt: posts.excerpt, metadata: posts.metadata })
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1)

  const title = post?.title ?? 'Nsisong Effiong'
  const meta = (post?.metadata ?? {}) as { kicker?: string; deck?: string }
  const kicker = meta.kicker ?? s.tagline
  const deck = meta.deck ?? post?.excerpt ?? null

  const scale = title.length > 70 ? 40 / 56 : title.length > 50 ? 48 / 56 : 1
  const titleSize = Math.round(s.title.baseSize * scale)

  const seed = hashSlug(slug)
  const ruleLength = 90 + (seed % 101) // 90–190px
  const ruleOffset = Math.floor(seed / 101) % 31 // 0–30px

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#F4F1EA',
          padding: '56px 64px',
        }}
      >
        {/* Top row: wordmark + section marker */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Fraunces',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 30,
              color: INK,
              display: 'flex',
            }}
          >
            Nsisong Effiong
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono',
              fontWeight: 400,
              fontSize: 20,
              color: s.accent,
              display: 'flex',
            }}
          >
            {s.marker}
          </div>
        </div>
        <div style={{ marginTop: 20, height: 1, background: HAIRLINE, display: 'flex' }} />

        {/* Middle band — all copy stays inside the vertical centre so a square crop keeps it */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Inter Tight',
              fontWeight: 700,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: s.accent,
              display: 'flex',
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              marginTop: 20,
              fontFamily: s.title.fontFamily,
              fontWeight: s.title.fontWeight,
              fontStyle: s.title.fontStyle,
              fontSize: titleSize,
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
              color: INK,
              maxWidth: 1020,
              display: 'block',
              lineClamp: 3,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 26,
              marginLeft: ruleOffset,
              width: ruleLength,
              height: 4,
              background: s.accent,
              display: 'flex',
            }}
          />
          {deck ? (
            <div
              style={{
                marginTop: 26,
                fontFamily: 'Source Serif 4',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 24,
                lineHeight: 1.35,
                color: '#53524C',
                maxWidth: 940,
                display: 'block',
                lineClamp: 2,
              }}
            >
              {deck}
            </div>
          ) : null}
        </div>

        {/* Bottom row */}
        <div style={{ marginBottom: 18, height: 1, background: HAIRLINE, display: 'flex' }} />
        <div
          style={{
            fontFamily: 'JetBrains Mono',
            fontWeight: 400,
            fontSize: 17,
            color: '#8E8C82',
            display: 'flex',
          }}
        >
          nsisongeffiong.com
        </div>
      </div>
    ),
    { ...ogSize, fonts }
  )
}
