import { useRef, type ReactNode } from 'react'
import { useContent, useT } from '../i18n'
import { useReveal } from '../hooks/useReveal'
import Tilt from '../components/Tilt'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const ICONS: ReactNode[] = [
  // web development — browser window
  <svg key="0" viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <path d="M3 9h18M7 6.8h.01M10 6.8h.01" />
  </svg>,
  // web applications — layers
  <svg key="1" viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
    <path d="M12 3 3 8l9 5 9-5-9-5Z" />
    <path d="m3 12.5 9 5 9-5M3 16.5l9 5 9-5" />
  </svg>,
  // e-commerce — bag
  <svg key="2" viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>,
  // business systems — nodes
  <svg key="3" viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
    <circle cx="6" cy="6" r="2.2" />
    <circle cx="18" cy="8" r="2.2" />
    <circle cx="9" cy="18" r="2.2" />
    <path d="m8 6.4 8 1.2M7 8l1.6 8M16.6 10l-5.4 6.4" />
  </svg>,
  // ui / ux — pen
  <svg key="4" viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
    <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
    <path d="m13.5 7.5 3 3" />
  </svg>,
  // digital experiences — spark
  <svg key="5" viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </svg>,
]

// Asymmetric bento: [4,2] [3,3] [2,4] columns on a 6-col grid.
const SPANS = ['md:col-span-4', 'md:col-span-2', 'md:col-span-3', 'md:col-span-3', 'md:col-span-2', 'md:col-span-4']

export default function Services() {
  const { services } = useContent()
  const t = useT()
  const sectionRef = useRef<HTMLElement>(null)

  useReveal(sectionRef)

  return (
    <section id="services" ref={sectionRef} className="relative w-full py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span data-reveal="fade" className="eyebrow eyebrow-line">
              {t('What We Do')}
            </span>
            <h2 data-reveal="blur" className="mt-5 font-display text-5xl font-semibold tracking-[-0.045em] text-bone sm:text-6xl md:text-7xl">
              {t('Services')}
            </h2>
          </div>
          <p data-reveal="up" data-delay="0.1" className="max-w-xs text-sm leading-relaxed text-bone/55">
            {t('Six disciplines, one studio — everything a business needs to operate confidently online.')}
          </p>
        </div>

        <div data-stagger="rise" data-each="0.1" className="mt-14 grid gap-5 md:grid-cols-6">
          {services.map((service, i) => (
            <Tilt key={service.index} className={`${SPANS[i]} rounded-[1.75rem]`} max={5}>
              <article
                data-cursor="View"
                className="glass relative flex h-full min-h-[270px] flex-col justify-between overflow-hidden rounded-[1.75rem] p-7 sm:p-8"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-60 transition-all duration-700 group-hover:-right-10 group-hover:-top-10 group-hover:opacity-100"
                  style={{
                    background:
                      i % 3 === 0
                        ? 'radial-gradient(closest-side, rgba(110,96,255,0.45), transparent)'
                        : i % 3 === 1
                          ? 'radial-gradient(closest-side, rgba(34,190,250,0.42), transparent)'
                          : 'radial-gradient(closest-side, rgba(255,143,184,0.45), transparent)',
                  }}
                />
                <div className="relative flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-accent shadow-[0_10px_26px_-10px_rgba(91,76,255,0.5)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                    {ICONS[i]}
                  </span>
                  <span className="font-mono text-xs font-medium text-bone/35">{service.index}</span>
                </div>

                <div className="relative mt-10">
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-bone sm:text-[1.7rem]">
                    {service.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-bone/60 sm:text-[0.95rem]">{service.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/70 px-3 py-1 font-mono text-[0.62rem] font-medium uppercase tracking-wider text-bone/55 ring-1 ring-bone/[0.07]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  )
}
