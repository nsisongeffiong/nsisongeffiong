import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import {
  Fraunces,
  Syne,
  JetBrains_Mono,
  Source_Serif_4,
} from 'next/font/google'
import './globals.css'

// ─── Font loading ─────────────────────────────────────────────────────────────
// Fraunces replaces Cormorant Garamond — kept under the same CSS var name
// so all existing pages (var(--font-cormorant)) update automatically.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',  // intentional: reuse existing var name
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

// JetBrains Mono replaces DM Mono — kept under same CSS var name
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-dm-mono',  // intentional: reuse existing var name
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
})

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'Nsisong Effiong',
    template: '%s · Nsisong Effiong',
  },
  description:
    'I write poems, build things, and think too hard about how the world works. This is where all of it lives.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nsisongeffiong.com'
  ),
  openGraph: {
    siteName: 'Nsisong Effiong',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@nsisong101',
  },
  alternates: {
    types: { 'application/rss+xml': '/api/rss' },
  },
}

// ─── Root layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`
        ${fraunces.variable}
        ${syne.variable}
        ${jetbrainsMono.variable}
        ${sourceSerif.variable}
      `}
    >
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
