'use client'
import { useEffect, useRef } from 'react'

export function IdeaMasonryGrid({ children }: { children: React.ReactNode }) {
  const sourceRef = useRef<HTMLDivElement>(null)
  const layoutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function build() {
      const source = sourceRef.current
      const layout = layoutRef.current
      if (!source || !layout) return

      // Clone cards from the hidden source — never touch React's nodes
      const cards = [...source.querySelectorAll<HTMLElement>('[data-masonry-card]')]
      if (!cards.length) {
        layout.innerHTML = ''
        return
      }

      const w = layout.clientWidth
      const numCols = w <= 768 ? 1 : w <= 1024 ? 2 : 3

      layout.innerHTML = ''
      layout.style.display = 'grid'
      layout.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`
      layout.style.alignItems = 'start'
      layout.style.position = 'relative'

      const colDivs = Array.from({ length: numCols }, () => {
        const d = document.createElement('div')
        d.style.display = 'flex'
        d.style.flexDirection = 'column'
        layout.appendChild(d)
        return d
      })

      cards.forEach((card, i) => {
        const clone = card.cloneNode(true) as HTMLElement
        colDivs[i % numCols].appendChild(clone)
      })

      colDivs.forEach(col => {
        const cc = [...col.querySelectorAll<HTMLElement>('[data-masonry-card]')]
        cc.forEach((c, i) => {
          c.style.borderBottom = i < cc.length - 1 ? '0.5px solid var(--bdr)' : 'none'
        })
      })

      for (let i = 1; i < numCols; i++) {
        const div = document.createElement('div')
        div.style.cssText = `position:absolute;top:0;bottom:0;left:${i * 100 / numCols}%;width:0.5px;background:var(--bdr);pointer-events:none`
        layout.appendChild(div)
      }
    }

    const t = setTimeout(build, 30)
    window.addEventListener('resize', build)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', build)
    }
  }, [children])

  return (
    <>
      {/* Hidden source — React owns these nodes, we never touch them */}
      <div ref={sourceRef} style={{ display: 'none' }}>{children}</div>
      {/* Layout container — built from clones, safe to mutate */}
      <div ref={layoutRef} className="idea-masonry-grid" />
    </>
  )
}
