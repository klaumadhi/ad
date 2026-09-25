import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useContent, useT } from '../i18n'

gsap.registerPlugin(ScrollTrigger)

export default function Process() {
  const { processSteps } = useContent()
  const t = useT()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.process-row').forEach((row, i) => {
        gsap.fromTo(
          row,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: i * 0.05,
            ease: 'power3.out',
            scrollTrigger: { trigger: row, start: 'top 88%' },
          },
        )
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="process" ref={sectionRef} className="relative w-full bg-ink py-28 sm:py-36">
      <div className="mx-auto max-w-4xl px-6">
        <span className="eyebrow eyebrow-line">{t('How We Work')}</span>
        <h2 className="mt-5 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-bone">
          {t('The Process')}
        </h2>
        <p className="mt-4 max-w-md text-sm sm:text-base text-bone/55">
          {t('Five steps, no shortcuts — the same path for every project, from first conversation to launch.')}
        </p>

        <div className="mt-16 border-t border-white/10">
          {processSteps.map((step) => (
            <div key={step.index} className="process-row group border-b border-white/10 py-8 sm:py-10">
              <div className="flex items-start gap-5 border-l-2 border-transparent pl-0 transition-[border-color,padding-left] duration-400 group-hover:border-red group-hover:pl-4 sm:gap-8">
                <span className="pt-1.5 font-display text-sm font-bold tabular-nums text-bone/30 transition-colors duration-400 group-hover:text-red sm:pt-2">
                  {step.index}
                </span>
                <p className="font-display text-2xl font-bold leading-snug tracking-tight sm:text-3xl md:text-4xl">
                  <span className="text-bone">{step.title}.</span>{' '}
                  <span className="font-normal text-bone/40 transition-colors duration-400 group-hover:text-bone/65">
                    {step.description}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
