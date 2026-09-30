import { useEffect, useId, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from '../hooks/useLenis'

gsap.registerPlugin(ScrollTrigger)

const R = 27
const C = 2 * Math.PI * R

/**
 * A liquid-core scroll gauge in the corner. A glowing energy ring traces how far down the page
 * you are while water rises inside the orb; both drain again as you scroll back up.
 * Tapping it returns to the top.
 */
export default function ScrollOrb() {
  const uid = useId().replace(/:/g, '')
  const waterRef = useRef<SVGGElement>(null)
  const arcRef = useRef<SVGCircleElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const water = waterRef.current
    const arc = arcRef.current
    const dot = dotRef.current
    if (!water || !arc || !dot) return

    const state = { p: 0 }
    const render = () => {
      // water surface: y=54 is empty (below the orb), y=4 is full
      water.setAttribute('transform', `translate(0 ${54 - state.p * 50})`)
      arc.setAttribute('stroke-dashoffset', String(C * (1 - state.p)))
      const a = -Math.PI / 2 + state.p * Math.PI * 2
      dot.setAttribute('cx', String(30 + R * Math.cos(a)))
      dot.setAttribute('cy', String(30 + R * Math.sin(a)))
      dot.setAttribute('opacity', state.p > 0.004 ? '1' : '0')
    }
    render()

    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        gsap.to(state, { p: self.progress, duration: 0.7, ease: 'power3.out', overwrite: true, onUpdate: render })
      },
    })
    return () => {
      st.kill()
      gsap.killTweensOf(state)
    }
  }, [])

  const toTop = () => {
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { duration: 1.6 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={toTop}
      aria-label="Back to top"
      data-cursor=""
      className="scroll-arrow group glass fixed bottom-5 right-3 z-[95] flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-500 hover:scale-110 sm:right-5"
    >
      <svg viewBox="0 0 60 60" className="h-[52px] w-[52px] overflow-visible">
        <defs>
          <clipPath id={`${uid}-core`}>
            <circle cx="30" cy="30" r="19.5" />
          </clipPath>
          <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#17b3f2" />
            <stop offset="100%" stopColor="#5b4cff" />
          </linearGradient>
          <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5b4cff" />
            <stop offset="100%" stopColor="#17b3f2" />
          </linearGradient>
        </defs>

        {/* slowly rotating HUD ticks */}
        <circle
          className="orb-ticks"
          cx="30"
          cy="30"
          r={R + 2.6}
          fill="none"
          stroke="rgba(91,76,255,0.4)"
          strokeWidth="1.4"
          strokeDasharray="1.2 4.2"
        />

        {/* ring track + progress arc */}
        <circle cx="30" cy="30" r={R} fill="none" stroke="rgba(12,16,51,0.09)" strokeWidth="2.2" />
        <circle
          ref={arcRef}
          cx="30"
          cy="30"
          r={R}
          fill="none"
          stroke={`url(#${uid}-ring)`}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
          transform="rotate(-90 30 30)"
          style={{ filter: 'drop-shadow(0 0 3px rgba(91,76,255,0.55))' }}
        />
        <circle ref={dotRef} cx="30" cy="3" r="2.8" fill="#fff" stroke="#17b3f2" strokeWidth="1.6" opacity="0" style={{ filter: 'drop-shadow(0 0 4px rgba(23,179,242,0.9))' }} />

        {/* liquid core */}
        <circle cx="30" cy="30" r="19.5" fill="rgba(255,255,255,0.55)" />
        <g clipPath={`url(#${uid}-core)`}>
          <g ref={waterRef}>
            <path
              className="water-wave-back"
              d="M-40 0 Q-30 -5 -20 0 T0 0 T20 0 T40 0 T60 0 T80 0 V90 H-40 Z"
              fill="rgba(23,179,242,0.5)"
            />
            <path
              className="water-wave-front"
              d="M-40 0 Q-30 5 -20 0 T0 0 T20 0 T40 0 T60 0 T80 0 V90 H-40 Z"
              fill={`url(#${uid}-water)`}
            />
          </g>
        </g>
        <circle cx="30" cy="30" r="19.5" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" />

        {/* double chevron */}
        <g className="orb-chev" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M23.5 31.5 30 25 36.5 31.5M23.5 38 30 31.5 36.5 38" stroke="rgba(12,16,51,0.45)" strokeWidth="4.2" />
          <path d="M23.5 31.5 30 25 36.5 31.5M23.5 38 30 31.5 36.5 38" stroke="#fff" strokeWidth="2.4" />
        </g>
      </svg>
    </button>
  )
}
