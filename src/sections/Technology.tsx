import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useContent, useT } from '../i18n'
import { useIsMobile, useIsTouch, useReducedMotion } from '../hooks/useMedia'
import { useReveal } from '../hooks/useReveal'

gsap.registerPlugin(ScrollTrigger)

// Deterministic pseudo-random so every tile always flies in from the same scattered spot.
const rnd = (i: number, k: number) => {
  const x = Math.sin((i + 1) * 127.1 + k * 311.7) * 43758.5453
  return x - Math.floor(x)
}

export default function Technology() {
  const { technologies } = useContent()
  const t = useT()
  const gridRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const isTouch = useIsTouch()
  const isMobile = useIsMobile()
  const reduced = useReducedMotion()

  useReveal(sectionRef)

  // Each tile lights up with a soft spotlight that follows the pointer across the tile.
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  // Desktop: tiles assemble out of scattered 3D positions as you scroll, then a scan beam
  // sweeps across the grid and powers up each tile it passes. Everything scrubs both ways.
  useEffect(() => {
    const grid = gridRef.current
    if (!grid || isMobile || reduced) return
    const tiles = gsap.utils.toArray<HTMLElement>('.tech-tile', grid)

    const ctx = gsap.context(() => {
      tiles.forEach((tile, i) => {
        gsap.fromTo(
          tile,
          {
            x: (rnd(i, 0) - 0.5) * 1000,
            y: (rnd(i, 1) - 0.5) * 520 + 140,
            rotationX: (rnd(i, 2) - 0.5) * 150,
            rotationY: (rnd(i, 3) - 0.5) * 150,
            rotationZ: (rnd(i, 4) - 0.5) * 50,
            scale: 0.35,
            opacity: 0,
            transformPerspective: 1100,
          },
          {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            scale: 1,
            opacity: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: tile, start: 'top 105%', end: 'top 60%', scrub: 0.8 },
          },
        )
      })

      let litCount = -1
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 42%',
        end: 'bottom 58%',
        onUpdate: (self) => {
          const p = self.progress
          const w = grid.offsetWidth
          if (beamRef.current) {
            beamRef.current.style.left = `${p * 100}%`
            beamRef.current.style.opacity = p > 0.005 && p < 0.995 ? '1' : '0'
          }
          let n = 0
          tiles.forEach((tile) => {
            const center = (tile.offsetLeft + tile.offsetWidth / 2) / w
            const lit = center < p
            tile.classList.toggle('is-lit', lit)
            if (lit) n += 1
          })
          if (n !== litCount && countRef.current) {
            litCount = n
            countRef.current.textContent = `${String(n).padStart(2, '0')} / ${String(tiles.length).padStart(2, '0')}`
          }
        },
      })
    }, grid)

    return () => ctx.revert()
  }, [isMobile, reduced, technologies.length])

  return (
    <section ref={sectionRef} className="relative w-full py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span data-reveal="fade" data-reveal-m="right" className="eyebrow eyebrow-line">
              {t('Technology')}
            </span>
            <h2
              data-reveal="blur"
              data-reveal-m="right"
              className="mt-5 font-display text-5xl font-semibold tracking-[-0.045em] text-bone sm:text-6xl md:text-7xl"
            >
              {t('The Stack')}
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <p data-reveal="up" data-reveal-m="left" data-delay="0.1" className="max-w-xs text-sm leading-relaxed text-bone/55 sm:text-right">
              {t('Modern, production-proven tools chosen for reliability.')}
            </p>
            <div className="hidden items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-bone/45 md:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-2 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-2" />
              </span>
              {t('Stack online')}
              <span ref={countRef} className="text-accent">
                00 / {String(technologies.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        <div
          ref={gridRef}
          {...(isMobile ? { 'data-stagger': 'flip' } : {})}
          className="relative mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
        >
          {/* scan beam (desktop) */}
          <div
            ref={beamRef}
            aria-hidden
            className="pointer-events-none absolute -bottom-6 -top-6 z-20 hidden w-40 -translate-x-1/2 opacity-0 md:block"
            style={{
              left: '0%',
              background: 'linear-gradient(90deg, transparent, rgba(110,96,255,0.18) 40%, rgba(23,179,242,0.3) 50%, rgba(110,96,255,0.18) 60%, transparent)',
              transition: 'opacity 0.3s ease',
            }}
          >
            <span className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-accent-2 to-transparent shadow-[0_0_24px_4px_rgba(23,179,242,0.55)]" />
          </div>

          {technologies.map((tech) => {
            const isHovered = hovered === tech.name
            return (
              <div
                key={tech.name}
                onMouseMove={onMove}
                onMouseEnter={() => setHovered(tech.name)}
                onMouseLeave={() => setHovered(null)}
                className="tech-tile glass group relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-3xl p-5 sm:p-6"
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
                    className={`tech-dot h-2 w-2 rounded-full transition-all duration-300 ${
                      isHovered ? 'scale-125 bg-accent shadow-[0_0_12px_2px_rgba(91,76,255,0.6)]' : 'bg-bone/15'
                    }`}
                  />
                </div>

                <div className="relative">
                  <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-bone transition-colors duration-500 group-hover:text-accent group-[.is-lit]:text-accent sm:text-2xl">
                    {tech.name}
                  </h3>
                  <p
                    className={`mt-2 overflow-hidden text-xs leading-relaxed text-bone/55 transition-all duration-500 group-[.is-lit]:max-h-20 group-[.is-lit]:opacity-100 ${
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
