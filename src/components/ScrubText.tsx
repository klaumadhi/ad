import { useEffect, useRef, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export type Segment = { text: string; className?: string }

/** Text that "lights up" word by word as it scrolls through the viewport. */
export default function ScrubText({
  segments,
  as: Tag = 'p',
  className = '',
  from = 0.16,
}: {
  segments: Segment[]
  as?: ElementType
  className?: string
  from?: number
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null)
  const key = segments.map((s) => s.text).join('|')

  useEffect(() => {
    const el = ref.current as HTMLElement | null
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('.sw'),
        { opacity: from },
        {
          opacity: 1,
          stagger: 0.5,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: 0.6 },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [key, from])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const El: any = Tag
  return (
    <El ref={ref} className={className}>
      {segments.map((seg, si) =>
        seg.text.split(' ').map((w, wi) => (
          <span key={`${si}-${wi}`} className={`sw ${seg.className ?? ''}`}>
            {w}{' '}
          </span>
        )),
      )}
    </El>
  )
}
