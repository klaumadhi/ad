import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'

type GlitchLineProps = {
  children: ReactNode
  className?: string
  trigger?: string
  delay?: number
}

/**
 * A text line that stutters through a brief red/cyan channel-split glitch
 * before settling into its clean slide-up reveal — echoes the scan-line
 * glitch reveals from the reference footage.
 */
export default function GlitchLine({ children, className = '', trigger, delay = 0 }: GlitchLineProps) {
  const wrapRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const main = el.querySelector('.glitch-main')
    const red = el.querySelector('.glitch-red')
    const cyan = el.querySelector('.glitch-cyan')
    if (!main || !red || !cyan) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        delay,
        scrollTrigger: trigger ? { trigger, start: 'top 88%' } : undefined,
      })

      tl.set(el, { yPercent: 100 })
        .set([red, cyan], { opacity: 0 })
        .to(el, { yPercent: 0, duration: 0.01 })
        .to(el, { yPercent: 0, duration: 0.62, ease: 'power4.out' }, 0)
        .to(
          red,
          { opacity: 0.75, x: -6, duration: 0.05, repeat: 4, yoyo: true, ease: 'none' },
          0.05,
        )
        .to(
          cyan,
          { opacity: 0.6, x: 6, duration: 0.05, repeat: 4, yoyo: true, ease: 'none' },
          0.07,
        )
        .to([red, cyan], { opacity: 0, x: 0, duration: 0.12, ease: 'power2.out' }, 0.4)
    }, wrapRef)

    return () => ctx.revert()
  }, [trigger, delay])

  return (
    <span className="block overflow-hidden">
      <span ref={wrapRef} className={`relative block ${className}`}>
        <span className="glitch-main relative block">{children}</span>
        <span className="glitch-red pointer-events-none absolute inset-0 block text-red mix-blend-screen" aria-hidden>
          {children}
        </span>
        <span className="glitch-cyan pointer-events-none absolute inset-0 block text-[#4dd0e1] mix-blend-screen" aria-hidden>
          {children}
        </span>
      </span>
    </span>
  )
}
