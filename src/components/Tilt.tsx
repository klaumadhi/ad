import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { useIsTouch } from '../hooks/useMedia'

/** Card that leans toward the pointer in 3D and carries a soft moving highlight. */
export default function Tilt({
  children,
  className = '',
  max = 7,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isTouch = useIsTouch()

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (isTouch || !el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    gsap.to(el, { rotateY: px * max * 2, rotateX: -py * max * 2, transformPerspective: 900, duration: 0.45, ease: 'power2.out' })
    el.style.setProperty('--gx', `${(px + 0.5) * 100}%`)
    el.style.setProperty('--gy', `${(py + 0.5) * 100}%`)
  }
  const onLeave = () => {
    if (ref.current) gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' })
  }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`group relative will-change-transform ${className}`}>
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(360px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.55), transparent 60%)' }}
      />
    </div>
  )
}
