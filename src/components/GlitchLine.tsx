import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { intro, onIntro } from '../lib/intro'

type GlitchLineProps = {
  children: ReactNode
  className?: string
  trigger?: string
  delay?: number
}

/**
 * A headline line that glides up out of a mask with a slight tilt settling flat. (Name kept from
 * the earlier glitch effect so callers are unchanged.) Hero lines wait for the preloader hand-off;
 * lines with a `trigger` play when that element scrolls into view.
 */
export default function GlitchLine({ children, className = '', trigger, delay = 0 }: GlitchLineProps) {
  const wrapRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    let offIntro: () => void = () => {}
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        delay,
        paused: !trigger && !intro.started,
        scrollTrigger: trigger ? { trigger, start: 'top 88%' } : undefined,
      })
      if (!trigger && !intro.started) {
        offIntro = onIntro(() => tl.play())
      }

      // Hidden with opacity as well as offset so tall accents (e.g. the dots on "Ë") can't peek out.
      gsap.set(el, { yPercent: 112, opacity: 0, rotate: 3, transformOrigin: '0% 100%' })
      tl.to(el, { yPercent: 0, opacity: 1, rotate: 0, duration: 1.15, ease: 'power4.out' })
    }, wrapRef)

    return () => {
      offIntro()
      ctx.revert()
    }
  }, [trigger, delay])

  return (
    <span className="block overflow-hidden pb-[0.16em] -mb-[0.16em]">
      <span ref={wrapRef} className={`block ${className}`}>
        {children}
      </span>
    </span>
  )
}
