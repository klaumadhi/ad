import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useContent, useT } from '../i18n'
import { useReveal } from '../hooks/useReveal'

gsap.registerPlugin(ScrollTrigger)

export default function Process() {
  const { processSteps } = useContent()
  const t = useT()
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useReveal(sectionRef)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const ctx = gsap.context(() => {
      // The spine fills with the reader's progress; each node lights as it is reached.
      gsap.fromTo(
        '.process-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: list, start: 'top 60%', end: 'bottom 60%', scrub: 0.5 },
        },
      )
      gsap.utils.toArray<HTMLElement>('.process-step', list).forEach((step, i) => {
        const node = step.querySelector('.process-node')
        const card = step.querySelector('.process-card')
        ScrollTrigger.create({
          trigger: step,
          start: 'top 62%',
          onEnter: () => node?.classList.add('is-on'),
          onLeaveBack: () => node?.classList.remove('is-on'),
        })
        gsap.from(card, {
          opacity: 0,
          x: i % 2 === 0 ? -60 : 60,
          y: 30,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 82%', once: true },
        })
      })
    }, list)
    return () => ctx.revert()
  }, [processSteps.length])

  return (
    <section id="process" ref={sectionRef} className="relative w-full py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <span data-reveal="fade" className="eyebrow eyebrow-line">
            {t('How We Work')}
          </span>
          <h2 data-reveal="blur" className="mt-5 font-display text-5xl font-semibold tracking-[-0.045em] text-bone sm:text-6xl md:text-7xl">
            {t('The Process')}
          </h2>
          <p data-reveal="up" data-delay="0.1" className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-bone/55 sm:text-base">
            {t('Five steps, no shortcuts — the same path for every project, from first conversation to launch.')}
          </p>
        </div>

        <div ref={listRef} className="relative mt-20">
          <div className="absolute bottom-0 left-[1.15rem] top-0 w-[2px] rounded-full bg-bone/10 md:left-1/2 md:-translate-x-1/2">
            <div className="process-fill h-full w-full origin-top rounded-full bg-gradient-to-b from-accent via-accent-2 to-accent-3" />
          </div>

          <div className="space-y-10 md:space-y-16">
            {processSteps.map((step, i) => (
              <div key={step.index} className="process-step relative grid items-center md:grid-cols-2">
                <span className="process-node absolute left-[1.15rem] top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-bone/15 bg-white font-mono text-[0.7rem] font-medium text-bone/60 md:left-1/2">
                  {i + 1}
                </span>

                <div className={`process-card pl-14 md:pl-0 ${i % 2 === 0 ? 'md:pr-16' : 'md:col-start-2 md:pl-16'}`}>
                  <div className="glass rounded-3xl p-6 sm:p-8">
                    <span className="gradient-text font-mono text-xs font-semibold">{step.index}</span>
                    <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-bone sm:text-4xl">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-bone/60 sm:text-base">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
