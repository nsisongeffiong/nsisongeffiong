'use client'
import { useEffect, useRef } from 'react'
export function IdeaMasonryGrid({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  function markLastInColumn() {
    const grid = ref.current
    if (!grid) return
    const cards = [...grid.querySelectorAll<HTMLElement>('[data-masonry-card]')]
    cards.forEach(c => c.removeAttribute('data-col-last'))
    const cols: Record<number, HTMLElement[]> = {}
    cards.forEach(c => {
      const left = Math.round(c.getBoundingClientRect().left)
      if (!cols[left]) cols[left] = []
      cols[left].push(c)
    })
    Object.values(cols).forEach(col => {
      col[col.length - 1].setAttribute('data-col-last', '')
    })
  }
  useEffect(() => {
    markLastInColumn()
    window.addEventListener('resize', markLastInColumn)
    return () => window.removeEventListener('resize', markLastInColumn)
  }, [])
  return (
    <div ref={ref} style={{ columns: 3, columnGap: 0, columnRule: '0.5px solid var(--bdr)' }}>
      {children}
    </div>
  )
}
