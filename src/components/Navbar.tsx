import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useContent, useLang, useT } from '../i18n'
import MagneticButton from './MagneticButton'
import { getLenis } from '../hooks/useLenis'

export default function Navbar() {
  const { navLinks } = useContent()
  const { lang, setLang } = useLang()
  const t = useT()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('lenis-scroll' as any, onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('lenis-scroll' as any, onScroll)
    }
  }, [])

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
      <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 sm:px-6 pt-4 sm:pt-6 pointer-events-none">
        <div
          className={`pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-full border transition-all duration-500 ease-out ${
            scrolled
              ? 'border-white/10 bg-void/70 backdrop-blur-xl px-4 sm:px-6 py-2.5 shadow-[0_8px_40px_rgba(0,0,0,0.4)]'
              : 'border-transparent bg-transparent px-2 py-3'
          }`}
        >
          <a href="#top" onClick={(e) => { e.preventDefault(); goTo('#top') }} className="flex items-center gap-2.5 group" data-cursor="">
            <img
              src="/images/logo-mark-white.png"
              alt="Authentic Dev"
              className="h-8 w-auto sm:h-9 transition-transform duration-500 group-hover:scale-105"
            />
            <span className="hidden sm:block font-display font-bold tracking-tight text-sm">
              AUTHENTIC<span className="text-red"> DEV</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                data-cursor=""
                onClick={() => goTo(link.href)}
                className="relative px-4 py-2 text-xs font-semibold uppercase tracking-widest text-bone/70 hover:text-bone transition-colors duration-300"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-widest" role="group" aria-label="Language">
            {(['en', 'sq'] as const).map((l) => (
              <button
                key={l}
                data-cursor=""
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`px-2 py-1.5 transition-colors ${lang === l ? 'text-red' : 'text-bone/45 hover:text-bone'}`}
              >
                {l}
              </button>
            ))}
          </div>

          <MagneticButton
            as="button"
            cursorLabel=""
            onClick={() => goTo('#contact')}
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-void hover:bg-red hover:text-white"
          >
            {t("Let's Talk")}
            <span aria-hidden>→</span>
          </MagneticButton>

          <button
            className="md:hidden flex h-10 w-10 flex-col items-center justify-center gap-1.5"
            aria-label={t('Toggle menu')}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span
              className={`block h-px w-5 bg-bone transition-transform duration-300 ${menuOpen ? 'translate-y-[3.5px] rotate-45' : ''}`}
            />
            <span
              className={`block h-px w-5 bg-bone transition-transform duration-300 ${menuOpen ? '-translate-y-[3.5px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[90] flex flex-col justify-center bg-void px-8 md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => goTo(link.href)}
                  className="text-left font-display text-4xl font-extrabold uppercase tracking-tight text-bone py-3 border-b border-white/10"
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                onClick={() => goTo('#contact')}
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-red px-6 py-3 text-sm font-bold uppercase tracking-widest text-white"
              >
                {t("Let's Talk")} →
              </motion.button>
              <div className="mt-6 flex gap-4 text-sm font-bold uppercase tracking-widest">
                {(['en', 'sq'] as const).map((l) => (
                  <button key={l} onClick={() => setLang(l)} className={lang === l ? 'text-red' : 'text-bone/50'}>
                    {l}
                  </button>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
