import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import {
  Cormorant_Garamond,
  Syne,
  DM_Mono,
  Source_Serif_4,
} from 'next/font/google'
import './globals.css'

// ─── Font loading ─────────────────────────────────────────────────────────────
const cormorant = Cormorant_Garamond({
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

const dmMono = DM_Mono({
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

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'Nsisong Effiong',
    template: '%s · Nsisong Effiong',
  },
  description: 'Poetry, code, and public thought — three modes of making sense of the world.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nsisongeffiong.com'),
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
    types: {
      'application/rss+xml': '/api/rss',
    },
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
        ${cormorant.variable}
        ${syne.variable}
        ${dmMono.variable}
        ${sourceSerif.variable}
      `}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
