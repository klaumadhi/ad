import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { technologies } from '../data/content'
import { useIsTouch } from '../hooks/useMedia'

gsap.registerPlugin(ScrollTrigger)

export default function Technology() {
  const gridRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const isTouch = useIsTouch()

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || !gridRef.current) return
    const rect = gridRef.current.getBoundingClientRect()
    gridRef.current.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    gridRef.current.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.tech-card',
        { opacity: 0, y: 24, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: { each: 0.05, grid: 'auto', from: 'start' },
          ease: 'power3.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 85%' },
        },
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full bg-void py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow eyebrow-line">Technology</span>
            <h2 className="mt-5 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-bone">
              The Stack
            </h2>
          </div>
          <p className="max-w-xs text-sm text-bone/50">Modern, production-proven tools chosen for reliability.</p>
        </div>

        <div
          ref={gridRef}
          onMouseMove={onMove}
          className="relative mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-3 md:grid-cols-4"
          style={{ '--mx': '50%', '--my': '50%' } as React.CSSProperties}
        >
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 sm:opacity-100"
            style={{
              background: 'radial-gradient(280px circle at var(--mx) var(--my), rgba(215,25,32,0.14), transparent 70%)',
            }}
          />

          {technologies.map((tech) => {
            const isHovered = hovered === tech.name
            return (
              <div
                key={tech.name}
                onMouseEnter={() => setHovered(tech.name)}
                onMouseLeave={() => setHovered(null)}
                className="tech-card group relative flex min-h-[150px] flex-col justify-between bg-void p-5 transition-colors duration-300 hover:bg-charcoal sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest text-bone/35">
                    {tech.category}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                      isHovered ? 'bg-red' : 'bg-bone/20'
                    }`}
                  />
                </div>

                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-bone transition-colors duration-300 group-hover:text-red">
                    {tech.name}
                  </h3>
                  <p
                    className={`mt-2 text-xs leading-relaxed text-bone/50 transition-all duration-300 ${
                      isHovered ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0 sm:max-h-0 sm:opacity-0'
                    } overflow-hidden`}
                  >
                    {tech.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
