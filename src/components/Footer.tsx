import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useContent, useT } from '../i18n'
import { getLenis } from '../hooks/useLenis'
import Logo from './Logo'
import Wordmark from './Wordmark'

gsap.registerPlugin(ScrollTrigger)

export default function Footer() {
  const { navLinks } = useContent()
  const t = useT()
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.footer-fade', {
        opacity: 0,
        y: 20,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: footerRef.current, start: 'top 88%', once: true },
      })
      // The giant wordmark rises and drifts as the footer scrolls in.
      gsap.fromTo(
        '.footer-word',
        { yPercent: 40, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: footerRef.current, start: 'top 90%', end: 'bottom bottom', scrub: 0.6 },
        },
      )
    }, footerRef)
    return () => ctx.revert()
  }, [])

  const goTo = (href: string) => {
    const el = document.querySelector(href)
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -24 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer ref={footerRef} className="relative w-full overflow-hidden px-4 pb-6 pt-10 sm:px-6">
      <div className="glass relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-6 pb-8 pt-12 sm:rounded-[2.5rem] sm:px-10">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="footer-fade flex items-center gap-3">
            <Logo className="h-10" />
            <Wordmark className="text-[0.95rem]" />
          </div>

          <nav className="footer-fade flex flex-wrap gap-x-8 gap-y-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => goTo(link.href)}
                className="group relative text-[0.85rem] font-medium text-bone/60 transition-colors hover:text-bone"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>
        </div>

        <p className="footer-fade mt-12 font-mono text-[0.65rem] font-medium uppercase tracking-[0.2em] text-bone/40">
          {t('Web Development • Digital Products • E-Commerce • Business Systems')}
        </p>

        <div
          aria-hidden
          className="footer-word pointer-events-none mt-6 select-none whitespace-nowrap text-center font-display text-[min(10.4vw,8.6rem)] font-semibold uppercase leading-[0.9] tracking-[-0.05em] text-bone"
        >
          Authentic <span className="text-accent">Dev</span>
        </div>

        <div className="footer-fade mt-6 flex flex-col items-start justify-between gap-3 border-t border-bone/10 pt-6 sm:flex-row sm:items-center">
          <span className="text-xs text-bone/45">
            © {new Date().getFullYear()} Authentic Dev. {t('All rights reserved.')}
          </span>
          <span className="text-xs text-bone/45">{t('Albanian web development studio.')}</span>
        </div>
      </div>
    </footer>
  )
}
