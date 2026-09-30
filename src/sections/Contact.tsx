import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import MagneticButton from '../components/MagneticButton'
import GlitchLine from '../components/GlitchLine'
import { useReveal } from '../hooks/useReveal'
import { useT } from '../i18n'

const projectTypes = ['Website', 'Web Application', 'E-Commerce', 'Business System', 'Other']

const fieldClass =
  'mt-2 w-full rounded-2xl bg-white/70 px-4 py-3.5 text-base text-bone ring-1 ring-bone/10 placeholder:text-bone/30 transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent'

export default function Contact() {
  const t = useT()
  const [sent, setSent] = useState(false)
  const [projectType, setProjectType] = useState(projectTypes[0])
  const sectionRef = useRef<HTMLElement>(null)

  useReveal(sectionRef, [sent])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  const infoRows = [
    { label: 'Email', value: t('authentic.dev.al@gmail.com'), href: 'mailto:authentic.dev.al@gmail.com' },
    { label: 'Location', value: t('Albania — working with businesses remotely') },
    { label: 'Social', value: t('Social links coming soon'), muted: true },
  ]

  return (
    <section id="contact" ref={sectionRef} className="relative w-full py-28 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <span data-reveal="fade" className="eyebrow eyebrow-line">
            {t('Get In Touch')}
          </span>
          <h2 className="contact-heading mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-bone sm:text-6xl md:text-7xl">
            <GlitchLine trigger=".contact-heading">{t("Let's Build")}</GlitchLine>
            <GlitchLine trigger=".contact-heading" delay={0.1}>
              {t('Something')}
            </GlitchLine>
            <GlitchLine trigger=".contact-heading" delay={0.2}>
              <span className="gradient-text-animated">{t('Authentic.')}</span>
            </GlitchLine>
          </h2>

          <div data-stagger="up" className="mt-12 space-y-3">
            {infoRows.map((row) => (
              <div key={row.label} className="glass flex flex-col gap-1 rounded-2xl px-5 py-4">
                <span className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.18em] text-bone/40">{t(row.label)}</span>
                {row.href ? (
                  <a href={row.href} data-cursor="Mail" className="text-[0.95rem] font-medium text-bone transition-colors hover:text-accent">
                    {row.value}
                  </a>
                ) : (
                  <span className={`text-[0.95rem] ${row.muted ? 'text-bone/45 italic' : 'text-bone/75'}`}>{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div data-reveal="rise">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass flex h-full min-h-[360px] flex-col justify-center rounded-[2rem] p-10 text-center"
            >
              <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-2xl text-white shadow-[0_14px_34px_-10px_rgba(91,76,255,0.7)]">
                ✓
              </span>
              <h3 className="font-display text-3xl font-semibold tracking-[-0.04em] text-bone">{t('Message Received')}</h3>
              <p className="mt-3 text-sm leading-relaxed text-bone/60">
                {t('Thanks for reaching out — this form is a working template ready to connect to your inbox.')}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={onSubmit} className="glass grid gap-6 rounded-[2rem] p-6 sm:p-9">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="eyebrow" htmlFor="name">
                    {t('Name')}
                  </label>
                  <input id="name" name="name" required className={fieldClass} placeholder={t('Your name')} />
                </div>
                <div>
                  <label className="eyebrow" htmlFor="email">
                    {t('Email')}
                  </label>
                  <input id="email" name="email" type="email" required className={fieldClass} placeholder="you@company.com" />
                </div>
              </div>

              <div>
                <label className="eyebrow" htmlFor="company">
                  {t('Company')}
                </label>
                <input id="company" name="company" className={fieldClass} placeholder={t('Business name')} />
              </div>

              <div>
                <span className="eyebrow block">{t('Project Type')}</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {projectTypes.map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setProjectType(type)}
                      className={`rounded-full px-4 py-2.5 text-[0.78rem] font-medium transition-all duration-300 ${
                        projectType === type
                          ? 'bg-bone text-white shadow-[0_10px_24px_-10px_rgba(12,16,51,0.6)]'
                          : 'bg-white/70 text-bone/60 ring-1 ring-bone/10 hover:bg-white hover:text-bone'
                      }`}
                    >
                      {t(type)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="eyebrow" htmlFor="message">
                  {t('Message')}
                </label>
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
                className="btn-primary mt-1 inline-flex w-fit items-center gap-2.5 rounded-full px-8 py-4 text-[0.85rem] font-semibold"
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
