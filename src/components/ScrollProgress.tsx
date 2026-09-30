import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Hairline gradient bar across the top that fills as the page is read. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tween = gsap.fromTo(
      el,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 right-0 top-0 z-[120] h-[3px] origin-left bg-gradient-to-r from-accent via-accent-2 to-accent-3"
      style={{ transform: 'scaleX(0)' }}
    />
  )
}
