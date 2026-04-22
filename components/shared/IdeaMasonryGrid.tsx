'use client'
import { useEffect, useRef } from 'react'
export function IdeaMasonryGrid({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function build() {
      const wrap = ref.current
      if (!wrap) return
      const cards = [...wrap.querySelectorAll<HTMLElement>('[data-masonry-card]')]
      if (!cards.length) return
      wrap.innerHTML = ''
      const w = wrap.clientWidth
      const numCols = w <= 768 ? 1 : w <= 1024 ? 2 : 3
      wrap.style.display = 'grid'
      wrap.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`
      wrap.style.alignItems = 'start'
      wrap.style.position = 'relative'
      const colDivs = Array.from({ length: numCols }, () => {
        const d = document.createElement('div')
        d.style.display = 'flex'
        d.style.flexDirection = 'column'
        wrap.appendChild(d)
        return d
      })
      cards.forEach((card, i) => colDivs[i % numCols].appendChild(card))
      colDivs.forEach(col => {
        const cc = [...col.querySelectorAll<HTMLElement>('[data-masonry-card]')]
        cc.forEach((c, i) => {
          c.style.borderBottom = i < cc.length - 1 ? '0.5px solid var(--bdr)' : 'none'
        })
      })
      for (let i = 1; i < numCols; i++) {
        const div = document.createElement('div')
        div.style.cssText = `position:absolute;top:0;bottom:0;left:${i * 100 / numCols}%;width:0.5px;background:var(--bdr);pointer-events:none`
        wrap.appendChild(div)
      }
    }
    setTimeout(build, 30)
    window.addEventListener('resize', build)
    return () => window.removeEventListener('resize', build)
  }, [children])
  return <div ref={ref} className="idea-masonry-grid">{children}</div>
}
