import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../hooks/useMedia'
import { useT } from '../i18n'

gsap.registerPlugin(ScrollTrigger)

export default function AlbanianIdentity() {
  const t = useT()
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef = useRef<HTMLImageElement>(null)
  const rightRef = useRef<HTMLImageElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      gsap.set([leftRef.current, rightRef.current], { x: 0, opacity: 1 })
      gsap.set(gridRef.current, { opacity: 1 })
      gsap.set(textRef.current, { opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          end: 'top 15%',
          scrub: 0.6,
        },
      })

      tl.fromTo(leftRef.current, { xPercent: -140, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'power2.out' }, 0)
        .fromTo(rightRef.current, { xPercent: 140, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'power2.out' }, 0)
        .to(flashRef.current, { opacity: 0.6, duration: 0.15 }, 0.42)
        .to(flashRef.current, { opacity: 0, duration: 0.35 }, 0.55)
        .fromTo(gridRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.45)
        .fromTo(textRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4 }, 0.55)
    }, sectionRef)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-void py-32 sm:py-44">
      <div ref={gridRef} className="grid-backdrop pointer-events-none absolute inset-0 opacity-30" />
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{ background: 'radial-gradient(circle at center, rgba(215,25,32,0.5), transparent 60%)' }}
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <span className="eyebrow eyebrow-line">{t('Albanian Identity')}</span>

        <div className="relative mt-10 flex h-40 w-full max-w-md items-center justify-center sm:h-52">
          <img
            ref={leftRef}
            src="/images/logo-mark-white.png"
            alt=""
            aria-hidden
            className="absolute left-1/2 h-full w-auto -translate-x-1/2"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
          <img
            ref={rightRef}
            src="/images/logo-mark-white.png"
            alt="Authentic Dev double-headed eagle monogram"
            className="absolute left-1/2 h-full w-auto -translate-x-1/2"
            style={{ clipPath: 'inset(0 0 0 50%)' }}
          />
        </div>

        <div ref={textRef} className="mt-8">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight tracking-tight text-bone">
            {t('Heritage')} <span className="text-red">+</span> {t('Technology')}
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm sm:text-base text-bone/55 leading-relaxed">
            {t('The double-headed eagle at the center of our identity is a quiet nod to where we build from — carried into every interface, system and line of code we ship.')}
          </p>
        </div>
      </div>
    </section>
  )
}
