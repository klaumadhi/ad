import { useRef } from 'react'
import gsap from 'gsap'
import MagneticButton from '../components/MagneticButton'
import GlitchLine from '../components/GlitchLine'
import { getLenis } from '../hooks/useLenis'
import { useIsTouch } from '../hooks/useMedia'
import { useT } from '../i18n'

export default function CTA() {
  const t = useT()
  const btnRef = useRef<HTMLDivElement>(null)
  const isTouch = useIsTouch()

  const onEnter = () => {
    if (isTouch || !btnRef.current) return
    gsap.fromTo(
      btnRef.current,
      { '--sweep': '-30%' } as gsap.TweenVars,
      { '--sweep': '130%', duration: 0.9, ease: 'power2.out' } as gsap.TweenVars,
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
    <section className="relative w-full overflow-hidden bg-void py-32 sm:py-44">
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-20 mask-fade-b" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red/10 blur-[120px]" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <h2 className="cta-heading font-display text-[10vw] sm:text-[7vw] md:text-7xl font-black uppercase leading-[0.94] tracking-tight text-bone">
          <GlitchLine trigger=".cta-heading" delay={0}>{t('Your Next')}</GlitchLine>
          <GlitchLine trigger=".cta-heading" delay={0.1}>{t('Digital Project')}</GlitchLine>
          <GlitchLine trigger=".cta-heading" delay={0.2} className="text-red">{t('Starts Here.')}</GlitchLine>
        </h2>

        <p className="mt-8 text-sm sm:text-base font-semibold uppercase tracking-widest text-bone/50">
          {t("Let's build it.")}
        </p>

        <MagneticButton
          as="button"
          strength={0.25}
          cursorLabel="Start"
          onMouseEnter={onEnter}
          onClick={scrollToContact}
          className="relative mt-10 overflow-hidden rounded-full bg-bone px-10 py-5 text-sm font-bold uppercase tracking-widest text-void"
        >
          <div ref={btnRef} className="pointer-events-none absolute inset-0" style={{ '--sweep': '-30%' } as React.CSSProperties}>
            <span
              className="absolute inset-y-0 w-1/3"
              style={{
                left: 'var(--sweep)',
                background: 'linear-gradient(90deg, transparent, rgba(215,25,32,0.9), transparent)',
              }}
            />
          </div>
          <span className="relative z-10">{t('Start a Project →')}</span>
        </MagneticButton>
      </div>
    </section>
  )
}
