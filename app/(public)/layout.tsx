import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nsisong Effiong',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--txt)' }}>
      {children}
    </div>
  )
}
