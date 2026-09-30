import { lazy, Suspense, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticButton from '../components/MagneticButton'
import GlitchLine from '../components/GlitchLine'
import Marquee from '../components/Marquee'
import { useIsTouch, useReducedMotion } from '../hooks/useMedia'
import { getLenis } from '../hooks/useLenis'
import { onIntro } from '../lib/intro'
import { useContent, useT } from '../i18n'

const HeroScene = lazy(() => import('../three/HeroScene'))

gsap.registerPlugin(ScrollTrigger)

const CHIPS = [
  { key: 'Websites', cls: 'left-[7%] top-[27%] bob', depth: 26, dot: 'bg-accent' },
  { key: 'Stores', cls: 'right-[8%] top-[23%] bob-slow', depth: -34, dot: 'bg-accent-2' },
  { key: 'Dashboards', cls: 'left-[11%] bottom-[31%] bob-slow', depth: -20, dot: 'bg-accent-3' },
  { key: 'Apps', cls: 'right-[10%] bottom-[28%] bob', depth: 32, dot: 'bg-mint' },
]

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const logoWrapRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const isTouch = useIsTouch()
  const reduced = useReducedMotion()
  const t = useT()
  const { services } = useContent()

  useEffect(() => {
    let offIntro: () => void = () => {}
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, paused: true })
      gsap.set('.hero-sub, .hero-cta, .hero-scroll-cue, .hero-band', { opacity: 0, y: 24 })
      gsap.set('.hero-chip', { opacity: 0, scale: 0.7 })
      gsap.set(logoWrapRef.current, { opacity: 0 })
      tl.to(logoWrapRef.current, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.2)
        .to('.hero-sub', { opacity: 1, y: 0, duration: 0.9 }, 0.75)
        .to('.hero-cta', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.85)
        .to('.hero-chip', { opacity: 1, scale: 1, duration: 1, stagger: 0.12, ease: 'back.out(1.7)' }, 0.9)
        .to('.hero-scroll-cue', { opacity: 1, y: 0, duration: 0.8 }, 1.15)
        .to('.hero-band', { opacity: 1, y: 0, duration: 0.9 }, 1.1)
      offIntro = onIntro(() => tl.play())

      if (!reduced && sectionRef.current) {
        gsap.to(contentRef.current, {
          yPercent: -14,
          opacity: 0,
          scale: 0.94,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        })
      }

      // Pointer parallax on the floating chips (desktop only).
      if (!reduced && !isTouch && sectionRef.current) {
        const chips = gsap.utils.toArray<HTMLElement>('.hero-chip-inner')
        const setters = chips.map((c) => ({
          x: gsap.quickTo(c, 'x', { duration: 0.9, ease: 'power3.out' }),
          y: gsap.quickTo(c, 'y', { duration: 0.9, ease: 'power3.out' }),
          d: parseFloat(c.dataset.depth || '20'),
        }))
        const onMove = (e: MouseEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5
          const ny = e.clientY / window.innerHeight - 0.5
          setters.forEach((s) => {
            s.x(nx * s.d * 2)
            s.y(ny * s.d * 2)
          })
        }
        window.addEventListener('mousemove', onMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMove)
      }
    }, sectionRef)

    return () => {
      offIntro()
      ctx.revert()
    }
  }, [reduced, isTouch])

  const scrollToWork = () => {
    const el = document.querySelector('#work')
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -24 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToContact = () => {
    const el = document.querySelector('#contact')
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -24 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="top" ref={sectionRef} className="relative h-[100svh] min-h-[700px] w-full overflow-hidden">
      {!reduced && (
        <Suspense fallback={null}>
          <HeroScene isTouch={isTouch} />
        </Suspense>
      )}

      {/* Floating glass chips */}
      {!isTouch && (
        <div className="hero-hide pointer-events-none absolute inset-0 z-[5] hidden md:block">
          {CHIPS.map((c) => (
            <div key={c.key} className={`hero-chip absolute ${c.cls}`}>
              <div
                data-depth={c.depth}
                className="hero-chip-inner glass flex items-center gap-2.5 rounded-full py-2.5 pl-3.5 pr-5 text-[0.8rem] font-medium text-bone"
              >
                <span className={`h-2 w-2 rounded-full ${c.dot} shadow-[0_0_12px_2px] shadow-current`} />
                {t(c.key)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        ref={contentRef}
        className="hero-hide relative z-10 flex h-full w-full flex-col items-center justify-center px-6 pb-16 pt-6 text-center"
      >
        <div
          id="hero-logo-anchor"
          ref={logoWrapRef}
          className="mb-1 flex h-[150px] flex-col items-center justify-end sm:h-[180px] md:h-[200px]"
        >
          <span className="sr-only">Authentic Dev — AD monogram with double-headed eagle</span>
        </div>

        <h1 className="font-display font-semibold leading-[1.02] tracking-[-0.045em] text-bone">
          <GlitchLine className="text-[11vw] sm:text-[7.4vw] md:text-[5.6vw]" delay={0.1}>
            {t('We Build')} <span className="text-bone/30">{t('Digital')}</span>
          </GlitchLine>
          <GlitchLine className="text-[11vw] sm:text-[7.4vw] md:text-[5.6vw]" delay={0.22}>
            <span className="gradient-text-animated">{t('Experiences.', 'hero')}</span>
          </GlitchLine>
        </h1>

        <p className="hero-sub mt-6 max-w-xl text-balance text-[0.95rem] leading-relaxed sm:text-base">
          <span className="text-bone/80">{t('Websites and web applications, built around real businesses.')}</span>{' '}
          <span className="text-bone/45">{t('Not just design — systems that move the work forward.')}</span>
        </p>

        <div className="mt-8 flex flex-col items-center gap-3.5 sm:flex-row">
          <MagneticButton
            as="button"
            cursorLabel="View"
            onClick={scrollToWork}
            className="hero-cta btn-primary group inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-[0.85rem] font-semibold"
          >
            {t('Explore Our Work')}
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </MagneticButton>
          <MagneticButton
            as="button"
            cursorLabel=""
            onClick={scrollToContact}
            className="hero-cta btn-ghost group inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-[0.85rem] font-semibold"
          >
            {t("Let's Build Something")}
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </MagneticButton>
        </div>
      </div>

      <div className="hero-scroll-cue hero-hide pointer-events-none absolute bottom-[4.6rem] left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-bone/45 [@media(min-height:900px)]:flex">
        <span className="eyebrow text-[0.6rem]">{t('Scroll to Explore')}</span>
        <span className="relative h-8 w-[1.5px] overflow-hidden rounded-full bg-bone/15">
          <span className="absolute inset-x-0 top-0 h-3 animate-[cue_1.8s_ease-in-out_infinite] rounded-full bg-accent" />
        </span>
      </div>

      <div className="hero-band hero-hide absolute inset-x-0 bottom-0 z-10 border-t border-bone/[0.07] bg-white/35 py-3.5 backdrop-blur-md">
        <Marquee
          items={services.map((s) => s.title)}
          duration={52}
          itemClassName="font-display text-sm font-medium tracking-tight text-bone/55 sm:text-base"
        />
      </div>
    </section>
  )
}
