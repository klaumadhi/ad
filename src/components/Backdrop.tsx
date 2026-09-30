import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Fixed, page-wide aurora: three drifting colour fields plus a faint dot grid. The wrappers
 * drift with scroll at different speeds (parallax) while the inner blobs drift on their own.
 */
export default function Backdrop() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const ctx = gsap.context(() => {
      const shift: Record<string, number> = { '.wa': 260, '.wb': -320, '.wc': 420 }
      Object.entries(shift).forEach(([sel, y]) => {
        gsap.to(sel, {
          y,
          ease: 'none',
          scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.2 },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void">
      <div className="wa absolute inset-0">
        <div className="aurora-blob a" />
      </div>
      <div className="wb absolute inset-0">
        <div className="aurora-blob b" />
      </div>
      <div className="wc absolute inset-0">
        <div className="aurora-blob c" />
      </div>
      <div className="dot-grid absolute inset-0 opacity-70" />
    </div>
  )
}
