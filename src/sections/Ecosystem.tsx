import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useContent, useT } from '../i18n'
import { useIsMobile } from '../hooks/useMedia'
import { useReveal } from '../hooks/useReveal'
import Logo from '../components/Logo'

gsap.registerPlugin(ScrollTrigger)

export default function Ecosystem() {
  const { ecosystemItems } = useContent()
  const t = useT()
  const rootRef = useRef<HTMLElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const orbitRef = useRef<HTMLDivElement>(null)
  const mobileRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const radius = 250

  useReveal(rootRef, [isMobile])

  useEffect(() => {
    if (isMobile) {
      const el = mobileRef.current
      if (!el) return
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.eco-hub',
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'back.out(1.8)',
            scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' },
          },
        )
        gsap.fromTo(
          '.eco-tag',
          { opacity: 0, y: 18, scale: 0.85 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.06,
            ease: 'back.out(1.6)',
            scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play none none reverse' },
          },
        )
      }, mobileRef)
      return () => ctx.revert()
    }

    const orbit = orbitRef.current
    if (!orbit) return
    const nodes = gsap.utils.toArray<HTMLElement>('.orbit-node', orbit)

    const ctx = gsap.context(() => {
      gsap.fromTo(
        nodes,
        { scale: 0, opacity: 0, x: 0, y: 0 },
        {
          scale: 1,
          opacity: 1,
          x: (i) => Math.cos((i / nodes.length) * Math.PI * 2 - Math.PI / 2) * radius,
          y: (i) => Math.sin((i / nodes.length) * Math.PI * 2 - Math.PI / 2) * radius,
          duration: 1.3,
          stagger: 0.07,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        },
      )

      // Rings turn slowly and faster while the page scrolls.
      gsap.to('.eco-ring-a', {
        rotate: 360,
        ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      })
      gsap.to('.eco-ring-b', {
        rotate: -360,
        ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      })

      const floaters = gsap.utils.toArray<HTMLElement>('.orbit-float', orbit)
      floaters.forEach((node, i) => {
        gsap.to(node, {
          y: 10 + (i % 3) * 6,
          duration: 2.4 + (i % 4) * 0.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.6 + i * 0.15,
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [radius, isMobile])

  return (
    <section ref={rootRef} className="relative w-full overflow-hidden py-28 sm:py-36">
      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <span data-reveal="fade" data-reveal-m="zoom" className="eyebrow eyebrow-line">
          {t('What We Build')}
        </span>
        <h2
          data-reveal="blur"
          data-reveal-m="skew"
          className="mx-auto mt-5 max-w-3xl font-display text-5xl font-semibold tracking-[-0.045em] text-bone sm:text-6xl md:text-7xl"
        >
          {t('A Digital Ecosystem')}
        </h2>
        <p data-reveal="up" data-delay="0.1" className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-bone/55 sm:text-base">
          {t('Every product we build connects back to the same foundation — clean systems, built to work together.')}
        </p>
      </div>

      {isMobile ? (
        <div ref={mobileRef} className="relative z-10 mt-14 flex flex-col items-center gap-8 px-6">
          <div className="eco-hub glass flex h-24 w-24 items-center justify-center rounded-full">
            <Logo className="h-9" />
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {ecosystemItems.map((item) => (
              <span key={item} className="eco-tag glass rounded-full px-4 py-2.5 text-[0.78rem] font-medium text-bone/80">
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div ref={sectionRef} className="relative z-10 mx-auto mt-16 flex h-[640px] w-full max-w-3xl items-center justify-center">
          <div ref={orbitRef} className="relative flex h-0 w-0 items-center justify-center">
            <div className="eco-ring-a pointer-events-none absolute h-[500px] w-[500px] rounded-full border border-dashed border-accent/30" />
            <div className="eco-ring-b pointer-events-none absolute h-[330px] w-[330px] rounded-full border border-dashed border-accent-2/40" />
            <div className="pointer-events-none absolute h-56 w-56 animate-pulse rounded-full bg-accent/20 blur-3xl" />

            <div className="glass absolute z-10 flex h-32 w-32 items-center justify-center rounded-full">
              <Logo className="h-12" />
            </div>

            {ecosystemItems.map((item) => (
              <div key={item} className="orbit-node absolute flex items-center justify-center">
                <div className="orbit-float glass whitespace-nowrap rounded-full px-5 py-3 text-[0.82rem] font-medium text-bone/80 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-accent">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
