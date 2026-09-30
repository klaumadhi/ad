import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Endless text ribbon whose speed surges (and direction follows) with the page's scroll velocity. */
export default function Marquee({
  items,
  reverse = false,
  duration = 46,
  className = '',
  itemClassName = '',
}: {
  items: string[]
  reverse?: boolean
  duration?: number
  className?: string
  itemClassName?: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const key = items.join('|')

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const base = reverse ? -1 : 1
    const tween = gsap.fromTo(
      track,
      { xPercent: reverse ? -50 : 0 },
      { xPercent: reverse ? 0 : -50, repeat: -1, ease: 'none', duration },
    )
    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 220, 7)
        gsap
          .timeline({ defaults: { overwrite: true } })
          .to(tween, { timeScale: boost * self.direction * base, duration: 0.25 })
          .to(tween, { timeScale: self.direction * base, duration: 1.4 })
      },
    })
    return () => {
      st.kill()
      tween.kill()
    }
  }, [key, reverse, duration])

  const row = (k: string) => (
    <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 'b'}>
      {items.map((it, i) => (
        <span key={`${k}${i}`} className={`flex items-center whitespace-nowrap ${itemClassName}`}>
          {it}
          <span className="mx-8 inline-block h-2 w-2 rotate-45 rounded-[2px] bg-gradient-to-br from-accent to-accent-2 sm:mx-12" />
        </span>
      ))}
    </div>
  )

  return (
    <div ref={rootRef} className={`marquee-fade overflow-hidden ${className}`}>
      <div ref={trackRef} className="flex w-max will-change-transform">
        {row('a')}
        {row('b')}
      </div>
    </div>
  )
}
