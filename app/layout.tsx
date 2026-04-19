import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import {
  Fraunces,
  Syne,
  JetBrains_Mono,
  Source_Serif_4,
  Inter_Tight,
} from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-dm-mono',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
})

// Inter Tight — used for Ideas section display headings only.
// More neutral than Syne at heavy weights; avoids the compressed look at large sizes.
const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-inter-tight',
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
        ${interTight.variable}
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
