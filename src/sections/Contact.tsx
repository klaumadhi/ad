import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticButton from '../components/MagneticButton'
import { useT } from '../i18n'

gsap.registerPlugin(ScrollTrigger)

const projectTypes = ['Website', 'Web Application', 'E-Commerce', 'Business System', 'Other']

const fieldClass =
  'w-full border-b border-white/15 bg-transparent py-3 text-base text-bone placeholder:text-bone/30 focus:border-red focus:outline-none transition-colors duration-300'

export default function Contact() {
  const t = useT()
  const [sent, setSent] = useState(false)
  const [projectType, setProjectType] = useState(projectTypes[0])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.contact-line').forEach((el, i) => {
        gsap.fromTo(
          el,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            delay: i * 0.06,
            ease: 'power4.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          },
        )
      })
      gsap.fromTo(
        '.contact-info-row',
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.contact-info-group', start: 'top 85%' },
        },
      )
      gsap.fromTo(
        '.contact-field',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.contact-form', start: 'top 85%' },
        },
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="contact" ref={sectionRef} className="relative w-full bg-ink py-28 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <span className="eyebrow eyebrow-line">{t('Get In Touch')}</span>
          <h2 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.96] tracking-tight text-bone">
            <span className="block overflow-hidden"><span className="contact-line block">{t("Let's Build")}</span></span>
            <span className="block overflow-hidden"><span className="contact-line block">{t('Something')}</span></span>
            <span className="block overflow-hidden"><span className="contact-line block text-red">{t('Authentic.')}</span></span>
          </h2>

          <div className="contact-info-group mt-12 space-y-6 text-sm">
            <div className="contact-info-row">
              <span className="block text-[0.65rem] font-bold uppercase tracking-widest text-bone/40">{t('Email')}</span>
              <span className="mt-1 block text-bone/60 italic">{t('Add contact email — placeholder')}</span>
            </div>
            <div className="contact-info-row">
              <span className="block text-[0.65rem] font-bold uppercase tracking-widest text-bone/40">{t('Location')}</span>
              <span className="mt-1 block text-bone/60">{t('Albania — working with businesses remotely')}</span>
            </div>
            <div className="contact-info-row">
              <span className="block text-[0.65rem] font-bold uppercase tracking-widest text-bone/40">{t('Social')}</span>
              <span className="mt-1 block text-bone/60 italic">{t('Social links coming soon')}</span>
            </div>
          </div>
        </div>

        <div>
          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex h-full min-h-[320px] flex-col justify-center rounded-2xl border border-white/10 bg-void/40 p-10 text-center"
            >
              <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red/40 text-red text-xl">
                ✓
              </span>
              <h3 className="font-display text-2xl font-bold uppercase text-bone">{t('Message Received')}</h3>
              <p className="mt-3 text-sm text-bone/55">
                {t('Thanks for reaching out — this form is a working template ready to connect to your inbox.')}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={onSubmit} className="contact-form grid gap-7">
              <div className="contact-field grid gap-7 sm:grid-cols-2">
                <div>
                  <label className="eyebrow" htmlFor="name">{t('Name')}</label>
                  <input id="name" name="name" required className={fieldClass} placeholder={t('Your name')} />
                </div>
                <div>
                  <label className="eyebrow" htmlFor="email">{t('Email')}</label>
                  <input id="email" name="email" type="email" required className={fieldClass} placeholder="you@company.com" />
                </div>
              </div>

              <div className="contact-field">
                <label className="eyebrow" htmlFor="company">{t('Company')}</label>
                <input id="company" name="company" className={fieldClass} placeholder={t('Business name')} />
              </div>

              <div className="contact-field">
                <span className="eyebrow mb-3 block">{t('Project Type')}</span>
                <div className="flex flex-wrap gap-2">
                  {projectTypes.map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setProjectType(type)}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        projectType === type
                          ? 'border-red bg-red/10 text-red'
                          : 'border-white/15 text-bone/55 hover:border-white/30'
                      }`}
                    >
                      {t(type)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="contact-field">
                <label className="eyebrow" htmlFor="message">{t('Message')}</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className={`${fieldClass} resize-none`}
                  placeholder={t('Tell us about your project…')}
                />
              </div>

              <MagneticButton
                as="button"
                type="submit"
                cursorLabel="Send"
                className="contact-field mt-2 inline-flex w-fit items-center gap-2.5 rounded-full bg-red px-8 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-red-deep"
              >
                {t('Send Project →')}
              </MagneticButton>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
