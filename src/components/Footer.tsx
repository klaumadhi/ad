import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { navLinks } from '../data/content'
import { getLenis } from '../hooks/useLenis'

gsap.registerPlugin(ScrollTrigger)

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.footer-fade',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: footerRef.current, start: 'top 92%' },
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
    <footer ref={footerRef} className="relative w-full overflow-hidden border-t border-white/10 bg-void px-6 pb-10 pt-16 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="footer-fade flex items-center gap-3">
            <img src="/images/logo-mark-white.png" alt="Authentic Dev" className="h-10 w-auto opacity-90" />
            <span className="font-display text-sm font-bold uppercase tracking-tight text-bone">
              Authentic<span className="text-red"> Dev</span>
            </span>
          </div>

          <nav className="footer-fade flex flex-wrap gap-x-8 gap-y-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => goTo(link.href)}
                className="group relative text-xs font-semibold uppercase tracking-widest text-bone/50 hover:text-red transition-colors"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-red transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>
        </div>

        <p className="footer-fade text-xs font-semibold uppercase tracking-[0.2em] text-bone/35">
          Web Development • Digital Products • E-Commerce • Business Systems
        </p>

        <div className="footer-fade flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <span className="text-xs text-bone/35">© {new Date().getFullYear()} Authentic Dev. All rights reserved.</span>
          <span className="text-xs text-bone/35">Albanian web development studio.</span>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 opacity-[0.06] animate-[spin_60s_linear_infinite]"
      >
        <img src="/images/logo-mark-white.png" alt="" className="h-full w-full object-contain" />
      </div>
    </footer>
  )
}
