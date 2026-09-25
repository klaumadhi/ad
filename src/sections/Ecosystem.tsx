import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useContent, useT } from '../i18n'
import { useIsMobile } from '../hooks/useMedia'

gsap.registerPlugin(ScrollTrigger)

export default function Ecosystem() {
  const { ecosystemItems } = useContent()
  const t = useT()
  const sectionRef = useRef<HTMLDivElement>(null)
  const orbitRef = useRef<HTMLDivElement>(null)
  const mobileRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const radius = 240

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
            duration: 0.6,
            ease: 'back.out(1.8)',
            scrollTrigger: { trigger: el, start: 'top 80%' },
          },
        )
        gsap.fromTo(
          '.eco-tag',
          { opacity: 0, y: 14, scale: 0.85 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: 'back.out(1.6)',
            scrollTrigger: { trigger: el, start: 'top 75%' },
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
          duration: 1.1,
          stagger: 0.06,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        },
      )

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
    <section className="relative w-full overflow-hidden bg-ink py-28 sm:py-36">
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <span className="eyebrow eyebrow-line">{t('What We Build')}</span>
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-bone">
          {t('A Digital Ecosystem')}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm sm:text-base text-bone/55">
          {t('Every product we build connects back to the same foundation — clean systems, built to work together.')}
        </p>
      </div>

      {isMobile ? (
        <div ref={mobileRef} className="relative z-10 mt-14 flex flex-col items-center gap-8 px-6">
          <div className="eco-hub flex h-20 w-20 items-center justify-center rounded-full border border-red/30 bg-void shadow-[0_0_60px_rgba(215,25,32,0.25)]">
            <img src="/images/logo-mark-white.png" alt="AD" className="h-10 w-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {ecosystemItems.map((item) => (
              <span
                key={item}
                className="eco-tag rounded-full border border-white/10 bg-charcoal/80 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-widest text-bone/75"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={sectionRef}
          className="relative z-10 mx-auto mt-16 flex h-[620px] w-full max-w-3xl items-center justify-center"
        >
          <div ref={orbitRef} className="relative flex h-0 w-0 items-center justify-center">
            <div className="absolute z-10 flex h-24 w-24 items-center justify-center rounded-full border border-red/30 bg-void shadow-[0_0_60px_rgba(215,25,32,0.25)]">
              <img src="/images/logo-mark-white.png" alt="AD" className="h-12 w-auto" />
            </div>

            {ecosystemItems.map((item) => (
              <div key={item} className="orbit-node absolute flex items-center justify-center">
                <div className="orbit-float whitespace-nowrap rounded-full border border-white/10 bg-charcoal/80 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-bone/75 backdrop-blur-sm hover:border-red hover:text-red transition-colors duration-300">
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
