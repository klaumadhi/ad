import { lazy, Suspense, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticButton from '../components/MagneticButton'
import GlitchLine from '../components/GlitchLine'
import { useIsTouch, useReducedMotion } from '../hooks/useMedia'
import { getLenis } from '../hooks/useLenis'

const HeroScene = lazy(() => import('../three/HeroScene'))

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const logoWrapRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const isTouch = useIsTouch()
  const reduced = useReducedMotion()

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.set(logoWrapRef.current, { opacity: 0, scale: 0.85 })
        .set('.hero-sub, .hero-cta, .hero-scroll-cue', { opacity: 0, y: 20 })
        .to(logoWrapRef.current, { opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out' }, 0.1)
        .to('.hero-sub', { opacity: 1, y: 0, duration: 0.9 }, 1.05)
        .to('.hero-cta', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 1.15)
        .to('.hero-scroll-cue', { opacity: 1, y: 0, duration: 0.8 }, 1.4)

      if (!reduced && sectionRef.current) {
        gsap.to(contentRef.current, {
          yPercent: -18,
          opacity: 0,
          scale: 0.92,
          filter: 'blur(6px)',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reduced])

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
    <section id="top" ref={sectionRef} className="relative h-[100svh] min-h-[680px] w-full overflow-hidden bg-void">
      {!reduced ? (
        <Suspense fallback={<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1b1e24_0%,_#08090B_70%)]" />}>
          <HeroScene isTouch={isTouch} />
        </Suspense>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1b1e24_0%,_#08090B_70%)]" />
      )}

      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-40 mask-fade-b" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/10 via-transparent to-void" />

      <div
        ref={contentRef}
        className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center"
      >
        <div ref={logoWrapRef} className="mb-3 flex h-[160px] flex-col items-center justify-end sm:h-[190px] md:h-[220px]">
          <span className="sr-only">Authentic Dev — AD monogram with double-headed eagle</span>
          <span
            aria-hidden
            className="bg-gradient-to-b from-white via-bone to-bone/70 bg-clip-text font-display text-sm font-bold tracking-[0.35em] text-transparent sm:text-base"
          >
            AUTHENTIC DEV
          </span>
        </div>

        <h1 className="font-display font-black uppercase leading-[0.92] tracking-tight text-bone">
          <GlitchLine className="text-[10vw] sm:text-[7.5vw] md:text-[5.4vw]" delay={0.5}>
            We Build <span className="text-bone/35">Digital</span>
          </GlitchLine>
          <GlitchLine className="text-[10vw] sm:text-[7.5vw] md:text-[5.4vw]" delay={0.62}>
            <span className="text-red">Experiences.</span>
          </GlitchLine>
        </h1>

        <p className="hero-sub mt-6 max-w-xl text-balance text-sm sm:text-base">
          <span className="text-bone">Websites and web applications, built around real businesses.</span>{' '}
          <span className="text-bone/45">Not just design — systems that move the work forward.</span>
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center gap-4">
          <MagneticButton
            as="button"
            cursorLabel="View"
            onClick={scrollToWork}
            className="hero-cta group inline-flex items-center gap-2.5 rounded-full bg-bone px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-void hover:bg-red hover:text-white"
          >
            Explore Our Work
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
          </MagneticButton>
          <MagneticButton
            as="button"
            cursorLabel=""
            onClick={scrollToContact}
            className="hero-cta group inline-flex items-center gap-2.5 rounded-full border border-white/20 px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-bone hover:border-red hover:text-red"
          >
            Let's Build Something
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
          </MagneticButton>
        </div>
      </div>

      <div className="hero-scroll-cue pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-bone/50">
        <span className="eyebrow text-[0.65rem]">Scroll to Explore</span>
        <span className="animate-bounce text-lg">↓</span>
      </div>
    </section>
  )
}
