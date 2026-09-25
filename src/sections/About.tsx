import { lazy, Suspense, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsTouch, useReducedMotion } from '../hooks/useMedia'
import { useT } from '../i18n'

const AboutScene = lazy(() => import('../three/AboutScene'))

gsap.registerPlugin(ScrollTrigger)

const focusAreas = ['Web Development', 'E-Commerce', 'Web Applications', 'Business Systems']

export default function About() {
  const t = useT()
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRotation = useRef(0)
  const isTouch = useIsTouch()
  const reduced = useReducedMotion()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.about-line').forEach((el, i) => {
        gsap.fromTo(
          el,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1,
            ease: 'power4.out',
            delay: i * 0.08,
            scrollTrigger: { trigger: el, start: 'top 90%' },
          },
        )
      })

      gsap.fromTo(
        '.about-fade',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.about-fade-group', start: 'top 85%' },
        },
      )

      if (sectionRef.current) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            scrollRotation.current = (self.progress - 0.5) * Math.PI
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={sectionRef} className="relative w-full overflow-hidden bg-void py-28 sm:py-36 md:py-44">
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-25" />

      {!isTouch && !reduced && (
        <div className="pointer-events-none absolute -right-24 top-1/2 hidden h-[560px] w-[560px] -translate-y-1/2 opacity-80 lg:block">
          <Suspense fallback={null}>
            <AboutScene scrollRotation={scrollRotation} />
          </Suspense>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <span className="eyebrow eyebrow-line about-fade">{t('Who We Are')}</span>

        <h2 className="mt-6 max-w-3xl font-display text-[9vw] sm:text-[6.5vw] md:text-[4.6vw] font-black uppercase leading-[0.94] tracking-tight text-bone">
          <span className="block overflow-hidden"><span className="about-line block">{t('We Turn Ideas')}</span></span>
          <span className="block overflow-hidden"><span className="about-line block">{t('Into Digital')}</span></span>
          <span className="block overflow-hidden"><span className="about-line block text-red">{t('Experiences.')}</span></span>
        </h2>

        <div className="about-fade-group mt-10 grid max-w-2xl gap-8 md:mt-14">
          <p className="about-fade text-balance text-base sm:text-lg text-bone/65 leading-relaxed">
            {t('AUTHENTIC DEV is a modern web development studio focused on building high-quality digital products for ambitious businesses.')}
          </p>

          <ul className="about-fade grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {focusAreas.map((area) => (
              <li key={area} className="border-t border-white/10 pt-3">
                <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-bone/45">{t(area)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
