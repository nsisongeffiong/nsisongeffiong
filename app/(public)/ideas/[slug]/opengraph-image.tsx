import { ImageResponse } from 'next/og'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [post] = await db.select({ title: posts.title }).from(posts).where(eq(posts.slug, slug)).limit(1)
  const title = post?.title ?? 'Nsisong Effiong'
  const fontSize = title.length > 70 ? 40 : title.length > 50 ? 48 : 56

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#F4F1EA',
          padding: '64px',
          position: 'relative',
        }}
      >
        {/* Amber top bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: '#C07A1D',
          }}
        />

        {/* Site wordmark */}
        <div
          style={{
            fontFamily: 'sans-serif',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#C07A1D',
            display: 'flex',
          }}
        >
          Nsisong Effiong
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Post title */}
        <div
          style={{
            fontFamily: 'serif',
            fontSize,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#1A1A17',
            maxWidth: 960,
            display: 'flex',
          }}
        >
          {title}
        </div>

        {/* Section label */}
        <div
          style={{
            marginTop: 28,
            fontFamily: 'sans-serif',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#8E8C82',
            display: 'flex',
          }}
        >
          Ideas & Policy · Essay
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
