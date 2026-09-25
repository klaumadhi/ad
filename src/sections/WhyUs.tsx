import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useT } from '../i18n'

gsap.registerPlugin(ScrollTrigger)

export default function WhyUs() {
  const t = useT()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.why-line').forEach((el, i) => {
        gsap.fromTo(
          el,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1,
            delay: i * 0.07,
            ease: 'power4.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          },
        )
      })
      gsap.fromTo(
        '.why-fade',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.why-fade', start: 'top 88%' },
        },
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full bg-void py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <span className="eyebrow eyebrow-line">{t('Why Authentic Dev')}</span>

        <h2 className="mt-6 font-display text-[8.5vw] sm:text-[6vw] md:text-5xl lg:text-6xl font-black uppercase leading-[1.02] tracking-tight text-bone">
          <span className="block overflow-hidden"><span className="why-line block text-bone/35">{t('Built For')}</span></span>
          <span className="block overflow-hidden"><span className="why-line block">{t('Real Businesses.')}</span></span>
          <span className="block overflow-hidden"><span className="why-line block text-bone/35">{t('Designed For')}</span></span>
          <span className="block overflow-hidden"><span className="why-line block text-red">{t('The Digital World.')}</span></span>
        </h2>

        <p className="why-fade mt-9 max-w-xl text-balance text-base sm:text-lg text-bone/60 leading-relaxed">
          {t('We combine modern technology, thoughtful design and practical business thinking to build digital products that people actually use.')}
        </p>
      </div>
    </section>
  )
}
