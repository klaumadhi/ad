import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../hooks/useMedia'
import { useT } from '../i18n'
import Logo from '../components/Logo'

gsap.registerPlugin(ScrollTrigger)

export default function AlbanianIdentity() {
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const t = useT()

  useEffect(() => {
    if (reduced) {
      gsap.set([leftRef.current, rightRef.current], { x: 0, opacity: 1 })
      gsap.set(textRef.current, { opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          end: 'top 12%',
          scrub: 0.6,
        },
      })

      tl.fromTo(leftRef.current, { xPercent: -160, opacity: 0, rotate: -8 }, { xPercent: 0, opacity: 1, rotate: 0, ease: 'power2.out' }, 0)
        .fromTo(rightRef.current, { xPercent: 160, opacity: 0, rotate: 8 }, { xPercent: 0, opacity: 1, rotate: 0, ease: 'power2.out' }, 0)
        .fromTo(haloRef.current, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 }, 0.4)
        .to(flashRef.current, { opacity: 0.8, duration: 0.15 }, 0.42)
        .to(flashRef.current, { opacity: 0, duration: 0.35 }, 0.55)
        .fromTo(textRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 0.55)

      // The halo keeps turning once the halves have met.
      gsap.to(haloRef.current?.firstElementChild ?? null, { rotate: 360, duration: 40, repeat: -1, ease: 'none' })
    }, sectionRef)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden py-32 sm:py-44">
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{ background: 'radial-gradient(circle at center, rgba(110,96,255,0.4), transparent 60%)' }}
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <span className="eyebrow eyebrow-line">{t('Albanian Identity')}</span>

        <div className="relative mt-12 flex h-36 w-full max-w-md items-center justify-center sm:h-44">
          <div ref={haloRef} className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="h-[130%] w-[130%] rounded-full opacity-70"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(110,96,255,0), rgba(110,96,255,0.35), rgba(34,190,250,0.3), rgba(255,143,184,0.3), rgba(110,96,255,0))',
                mask: 'radial-gradient(closest-side, transparent 58%, black 60%, black 68%, transparent 70%)',
                WebkitMask: 'radial-gradient(closest-side, transparent 58%, black 60%, black 68%, transparent 70%)',
              }}
            />
          </div>
          <div
            ref={leftRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          >
            <Logo className="h-full" />
          </div>
          <div
            ref={rightRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{ clipPath: 'inset(0 0 0 50%)' }}
          >
            <Logo className="h-full" title="Authentic Dev eagle mark" />
          </div>
        </div>

        <div ref={textRef} className="mt-10">
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-[-0.045em] text-bone sm:text-5xl md:text-6xl">
            {t('Heritage')} <span className="gradient-text">+</span> {t('Technology')}
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-bone/60 sm:text-base">
            {t(
              'The eagle at the center of our identity is a quiet nod to where we build from — carried into every interface, system and line of code we ship.',
            )}
          </p>
        </div>
      </div>
    </section>
  )
}
