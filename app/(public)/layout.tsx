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
    <div
      style={{
        background:  'var(--bg)',
        color:       'var(--txt)',
        maxWidth:    '1120px',
        margin:      '0 auto',
        boxShadow:   '0 0 0 0.5px var(--bdr)',
      }}
    >
      {children}
    </div>
  )
}
