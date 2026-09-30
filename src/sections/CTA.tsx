import { useRef } from 'react'
import gsap from 'gsap'
import MagneticButton from '../components/MagneticButton'
import GlitchLine from '../components/GlitchLine'
import { getLenis } from '../hooks/useLenis'
import { useIsTouch } from '../hooks/useMedia'
import { useReveal } from '../hooks/useReveal'
import { useT } from '../i18n'

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const btnRef = useRef<HTMLDivElement>(null)
  const isTouch = useIsTouch()
  const t = useT()

  useReveal(sectionRef)

  const onEnter = () => {
    if (isTouch || !btnRef.current) return
    gsap.fromTo(
      btnRef.current,
      { '--sweep': '-40%' } as gsap.TweenVars,
      { '--sweep': '140%', duration: 0.9, ease: 'power2.out' } as gsap.TweenVars,
    )
  }

  const scrollToContact = () => {
    const el = document.querySelector('#contact')
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -24 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={sectionRef} className="relative w-full px-4 py-20 sm:px-6 sm:py-32">
      <div
        data-reveal="scale"
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-accent via-[#6a5cff] to-accent-2 px-6 py-20 text-center shadow-[0_50px_120px_-40px_rgba(70,60,200,0.7)] sm:rounded-[3rem] sm:py-28"
      >
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 animate-pulse rounded-full bg-white/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-accent-3/50 blur-3xl" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1.2px)',
            backgroundSize: '26px 26px',
            maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <h2 className="cta-heading font-display text-[10.5vw] font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-[6.6vw] md:text-7xl">
            <GlitchLine trigger=".cta-heading" delay={0}>
              {t('Your Next')}
            </GlitchLine>
            <GlitchLine trigger=".cta-heading" delay={0.1}>
              {t('Digital Project')}
            </GlitchLine>
            <GlitchLine trigger=".cta-heading" delay={0.2} className="text-white/60">
              {t('Starts Here.')}
            </GlitchLine>
          </h2>

          <p className="mt-11 font-mono text-xs font-medium uppercase tracking-[0.22em] text-white/75">{t("Let's build it.")}</p>

          <MagneticButton
            as="button"
            strength={0.25}
            cursorLabel="Start"
            onMouseEnter={onEnter}
            onClick={scrollToContact}
            className="relative mt-10 overflow-hidden rounded-full bg-white px-10 py-5 text-sm font-semibold text-bone shadow-[0_20px_50px_-15px_rgba(12,16,51,0.6)]"
          >
            <div ref={btnRef} className="pointer-events-none absolute inset-0" style={{ '--sweep': '-40%' } as React.CSSProperties}>
              <span
                className="absolute inset-y-0 w-1/3"
                style={{
                  left: 'var(--sweep)',
                  background: 'linear-gradient(90deg, transparent, rgba(110,96,255,0.4), transparent)',
                }}
              />
            </div>
            <span className="relative z-10">{t('Start a Project →')}</span>
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
