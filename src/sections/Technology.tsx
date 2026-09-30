import { useRef, useState } from 'react'
import { useContent, useT } from '../i18n'
import { useIsTouch } from '../hooks/useMedia'
import { useReveal } from '../hooks/useReveal'

export default function Technology() {
  const { technologies } = useContent()
  const t = useT()
  const gridRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const isTouch = useIsTouch()

  useReveal(sectionRef)

  // Each tile lights up with a soft spotlight that follows the pointer across the tile.
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <section ref={sectionRef} className="relative w-full py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span data-reveal="fade" className="eyebrow eyebrow-line">
              {t('Technology')}
            </span>
            <h2 data-reveal="blur" className="mt-5 font-display text-5xl font-semibold tracking-[-0.045em] text-bone sm:text-6xl md:text-7xl">
              {t('The Stack')}
            </h2>
          </div>
          <p data-reveal="up" data-delay="0.1" className="max-w-xs text-sm leading-relaxed text-bone/55">
            {t('Modern, production-proven tools chosen for reliability.')}
          </p>
        </div>

        <div ref={gridRef} data-stagger="scale" data-each="0.05" className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {technologies.map((tech) => {
            const isHovered = hovered === tech.name
            return (
              <div
                key={tech.name}
                onMouseMove={onMove}
                onMouseEnter={() => setHovered(tech.name)}
                onMouseLeave={() => setHovered(null)}
                className="glass group relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-3xl p-5 transition-[transform,background] duration-500 hover:-translate-y-1.5 hover:bg-white/80 sm:p-6"
                style={{ '--mx': '50%', '--my': '50%' } as React.CSSProperties}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: 'radial-gradient(220px circle at var(--mx) var(--my), rgba(110,96,255,0.2), transparent 70%)' }}
                />
                <div className="relative flex items-center justify-between">
                  <span className="font-mono text-[0.6rem] font-medium uppercase tracking-widest text-bone/40">{tech.category}</span>
                  <span
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      isHovered ? 'scale-125 bg-accent shadow-[0_0_12px_2px_rgba(91,76,255,0.6)]' : 'bg-bone/15'
                    }`}
                  />
                </div>

                <div className="relative">
                  <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-bone transition-colors duration-300 group-hover:text-accent sm:text-2xl">
                    {tech.name}
                  </h3>
                  <p
                    className={`mt-2 overflow-hidden text-xs leading-relaxed text-bone/55 transition-all duration-500 ${
                      isHovered ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                    }`}
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
