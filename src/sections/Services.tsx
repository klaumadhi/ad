import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useContent, useT } from '../i18n'
import { useIsTouch } from '../hooks/useMedia'

gsap.registerPlugin(ScrollTrigger)

export default function Services() {
  const { services } = useContent()
  const t = useT()
  const [active, setActive] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const isTouch = useIsTouch()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.service-row',
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        },
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const trigger = (i: number) => {
    if (isTouch) setActive((cur) => (cur === i ? -1 : i))
    else setActive(i)
  }

  return (
    <section id="services" ref={sectionRef} className="relative w-full bg-ink py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow eyebrow-line">{t('What We Do')}</span>
            <h2 className="mt-5 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-bone">
              {t('Services')}
            </h2>
          </div>
          <p className="max-w-xs text-sm text-bone/50">
            {t('Six disciplines, one studio — everything a business needs to operate confidently online.')}
          </p>
        </div>

        <div className="mt-14 border-t border-white/10">
          {services.map((service, i) => {
            const isActive = active === i
            return (
              <div
                key={service.index}
                data-cursor="View"
                onMouseEnter={() => !isTouch && setActive(i)}
                onClick={() => trigger(i)}
                className="service-row group relative cursor-pointer overflow-hidden border-b border-white/10"
              >
                <motion.div
                  className="absolute inset-0 -z-0"
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(215,25,32,0.14) 0%, rgba(215,25,32,0.03) 45%, transparent 80%)',
                  }}
                />

                <motion.div
                  className="absolute left-0 top-0 h-full w-[3px] bg-red"
                  initial={false}
                  animate={{ scaleY: isActive ? 1 : 0 }}
                  style={{ transformOrigin: 'top' }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                />

                <div className="relative z-10 flex flex-col gap-4 py-7 pl-6 pr-6 sm:flex-row sm:items-center sm:gap-8 sm:py-9">
                  <span
                    className={`font-display text-sm font-bold tabular-nums transition-colors duration-300 ${
                      isActive ? 'text-red' : 'text-bone/30'
                    }`}
                  >
                    {service.index}
                  </span>

                  <motion.h3
                    animate={{ x: isActive ? 12 : 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 font-display text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-bone sm:w-[40%] sm:flex-none"
                  >
                    {service.title}
                  </motion.h3>

                  <motion.span
                    animate={{ rotate: isActive ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-xl text-bone/40 sm:hidden"
                    aria-hidden
                  >
                    +
                  </motion.span>

                  <div className="flex-1">
                    <p className="max-w-md text-sm sm:text-base text-bone/55">{service.description}</p>
                    <motion.div
                      initial={false}
                      animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 flex flex-wrap gap-2 pb-1">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-bone/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  <motion.span
                    animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -8 }}
                    transition={{ duration: 0.3 }}
                    className="hidden shrink-0 text-2xl text-red sm:block"
                    aria-hidden
                  >
                    →
                  </motion.span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
