import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useContent, useLang, useT } from '../i18n'
import MagneticButton from './MagneticButton'
import Logo from './Logo'
import Wordmark from './Wordmark'
import { getLenis } from '../hooks/useLenis'

function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLang()
  return (
    <div
      role="group"
      aria-label="Language"
      className={`relative flex items-center rounded-full bg-bone/[0.06] p-1 font-mono text-[0.65rem] font-medium uppercase tracking-widest ${className}`}
    >
      {(['en', 'sq'] as const).map((l) => (
        <button
          key={l}
          data-cursor=""
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className="relative z-10 px-3 py-1.5 transition-colors duration-300"
        >
          {lang === l && (
            <motion.span
              layoutId="lang-pill"
              className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_4px_14px_-4px_rgba(70,60,200,0.45)]"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          )}
          <span className={lang === l ? 'text-accent-deep' : 'text-bone/50 hover:text-bone'}>{l}</span>
        </button>
      ))}
    </div>
  )
}

export default function Navbar() {
  const { navLinks } = useContent()
  const t = useT()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const lenis = getLenis()
    if (menuOpen) lenis?.stop()
    else lenis?.start()
    return () => lenis?.start()
  }, [menuOpen])

  const goTo = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -24 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-[100] flex justify-center px-4 pt-4 sm:px-6 sm:pt-5">
        <div
          className={`pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-full px-3 py-2 transition-all duration-500 ease-out sm:px-4 ${
            scrolled ? 'glass' : 'border border-transparent bg-transparent'
          }`}
        >
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              goTo('#top')
            }}
            className="group flex items-center gap-2.5 pl-1"
            data-cursor=""
          >
            <Logo className="h-8 transition-transform duration-500 group-hover:scale-105 sm:h-9" />
            <Wordmark className="hidden text-[0.82rem] sm:block" />
          </a>

          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.href}
                data-cursor=""
                onClick={() => goTo(link.href)}
                className="group relative px-4 py-2 text-[0.8rem] font-medium text-bone/65 transition-colors duration-300 hover:text-bone"
              >
                {link.label}
                <span className="absolute bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-300 group-hover:w-5" />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LangSwitch className="hidden md:flex" />
            <MagneticButton
              as="button"
              cursorLabel=""
              onClick={() => goTo('#contact')}
              className="btn-primary hidden items-center gap-2 rounded-full px-5 py-2.5 text-[0.8rem] font-semibold md:inline-flex"
            >
              {t("Let's Talk")}
              <span aria-hidden>→</span>
            </MagneticButton>

            <button
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full bg-bone/[0.06] md:hidden"
              aria-label={t('Toggle menu')}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span
                className={`block h-[1.5px] w-5 bg-bone transition-transform duration-300 ${menuOpen ? 'translate-y-[3.75px] rotate-45' : ''}`}
              />
              <span
                className={`block h-[1.5px] w-5 bg-bone transition-transform duration-300 ${menuOpen ? '-translate-y-[3.75px] -rotate-45' : ''}`}
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[90] flex flex-col justify-center bg-void/90 px-8 backdrop-blur-2xl md:hidden"
          >
            <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-accent-3/30 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-accent-2/25 blur-3xl" />
            <nav className="relative flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => goTo(link.href)}
                  className="flex items-baseline gap-4 border-b border-bone/10 py-3.5 text-left font-display text-4xl font-semibold tracking-tight text-bone"
                >
                  <span className="font-mono text-xs font-medium text-accent">0{i + 1}</span>
                  {link.label}
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="mt-8 flex items-center gap-4"
              >
                <button
                  onClick={() => goTo('#contact')}
                  className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
                >
                  {t("Let's Talk")} →
                </button>
                <LangSwitch />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
