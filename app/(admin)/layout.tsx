import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s · Admin',
  },
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--bg)',
        color: 'var(--txt)',
        fontFamily: 'var(--font-syne), sans-serif',
      }}
    >
      {children}
    </div>
  )
}
