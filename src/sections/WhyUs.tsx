import { useRef } from 'react'
import { useT } from '../i18n'
import { useReveal } from '../hooks/useReveal'
import ScrubText from '../components/ScrubText'

export default function WhyUs() {
  const sectionRef = useRef<HTMLElement>(null)
  const t = useT()

  useReveal(sectionRef)

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden py-32 sm:py-44">
      <div
        aria-hidden
        data-parallax="0.35"
        className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(181,139,255,0.35),transparent)]"
      />
      <div
        aria-hidden
        data-parallax="-0.3"
        className="pointer-events-none absolute -right-32 bottom-0 h-[380px] w-[380px] rounded-full bg-[radial-gradient(closest-side,rgba(34,190,250,0.32),transparent)]"
      />

      <div className="relative mx-auto max-w-5xl px-6">
        <span data-reveal="fade" data-reveal-m="right" className="eyebrow eyebrow-line">
          {t('Why Authentic Dev')}
        </span>

        <ScrubText
          as="h2"
          from={0.12}
          className="mt-8 font-display text-[9vw] font-semibold leading-[1.06] tracking-[-0.045em] text-bone sm:text-[6.4vw] md:text-6xl lg:text-7xl"
          segments={[
            { text: t('Built For'), className: 'text-bone/60' },
            { text: t('Real Businesses.') },
            { text: t('Designed For'), className: 'text-bone/60' },
            { text: t('The Digital World.'), className: 'gradient-text' },
          ]}
        />

        <p data-reveal="up" data-reveal-m="skew" className="mt-10 max-w-xl text-balance text-base leading-relaxed text-bone/60 sm:text-lg">
          {t(
            'We combine modern technology, thoughtful design and practical business thinking to build digital products that people actually use.',
          )}
        </p>
      </div>
    </section>
  )
}
