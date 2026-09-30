import { lazy, Suspense, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsTouch, useReducedMotion } from '../hooks/useMedia'
import { useReveal } from '../hooks/useReveal'
import GlitchLine from '../components/GlitchLine'
import ScrubText from '../components/ScrubText'
import Tilt from '../components/Tilt'
import { useT } from '../i18n'

const AboutScene = lazy(() => import('../three/AboutScene'))

gsap.registerPlugin(ScrollTrigger)

const focusAreas = ['Web Development', 'E-Commerce', 'Web Applications', 'Business Systems']

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRotation = useRef(0)
  const isTouch = useIsTouch()
  const reduced = useReducedMotion()
  const t = useT()

  useReveal(sectionRef)

  useEffect(() => {
    const ctx = gsap.context(() => {
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
    <section id="about" ref={sectionRef} className="relative w-full overflow-hidden py-28 sm:py-36 md:py-44">
      {!isTouch && !reduced && (
        <div className="pointer-events-none absolute -right-24 top-1/2 hidden h-[600px] w-[600px] -translate-y-1/2 lg:block" data-parallax="0.12">
          <Suspense fallback={null}>
            <AboutScene scrollRotation={scrollRotation} />
          </Suspense>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <span data-reveal="fade" data-reveal-m="left" className="eyebrow eyebrow-line">
          {t('Who We Are')}
        </span>

        <h2 className="about-heading mt-6 max-w-3xl font-display text-[10vw] font-semibold leading-[1.02] tracking-[-0.045em] text-bone sm:text-[7vw] md:text-[4.8vw]">
          <GlitchLine trigger=".about-heading">{t('We Turn Ideas')}</GlitchLine>
          <GlitchLine trigger=".about-heading" delay={0.1}>
            {t('Into Digital')}
          </GlitchLine>
          <GlitchLine trigger=".about-heading" delay={0.2}>
            <span className="gradient-text-animated">{t('Experiences.')}</span>
          </GlitchLine>
        </h2>

        <ScrubText
          className="mt-10 max-w-2xl text-balance text-xl font-medium leading-relaxed tracking-tight text-bone sm:text-2xl md:mt-14"
          segments={[
            {
              text: t(
                'AUTHENTIC DEV is a modern web development studio focused on building high-quality digital products for ambitious businesses.',
              ),
            },
          ]}
        />

        <ul data-stagger="rise" data-stagger-m="flip" className="mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {focusAreas.map((area, i) => (
            <li key={area}>
              <Tilt className="glass rounded-2xl p-5">
                <span className="font-mono text-[0.65rem] font-medium text-accent">0{i + 1}</span>
                <p className="mt-6 font-display text-[0.95rem] font-semibold leading-snug tracking-tight text-bone">
                  {t(area)}
                </p>
              </Tilt>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
