import { useEffect, useRef, useState } from 'react'
import { useIsTouch } from '../hooks/useMedia'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const isTouch = useIsTouch()
  const [label, setLabel] = useState('')
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (isTouch) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`
    }

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18
      ringY += (mouseY - ringY) * 0.18
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(tick)
    }

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest?.('[data-cursor]') as HTMLElement | null
      if (target) {
        setLabel(target.dataset.cursor || '')
        setActive(true)
      } else {
        setLabel('')
        setActive(false)
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(raf)
    }
  }, [isTouch])

  if (isTouch) return null

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div
        ref={ringRef}
        className="cursor-ring transition-[width,height,border-color,background-color] duration-300 ease-out"
        style={
          active
            ? {
                width: label ? '96px' : '64px',
                height: label ? '96px' : '64px',
                borderColor: '#D71920',
                background: 'rgba(215,25,32,0.12)',
              }
            : undefined
        }
      >
        <span
          className="uppercase transition-opacity duration-200"
          style={{ opacity: label ? 1 : 0, fontSize: '0.6rem', letterSpacing: '0.08em' }}
        >
          {label}
        </span>
      </div>
    </>
  )
}
