import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { startIntro, heroIntro } from '../lib/intro'
import { useT } from '../i18n'

const MIN_MS = 2200
const MAX_MS = 9000

export default function Preloader() {
  const t = useT()
  const rootRef = useRef<HTMLDivElement>(null)
    const glowRef = useRef<HTMLDivElement>(null)
  const uiRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(0)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    html.style.overflow = 'hidden'
    html.classList.add('is-loading')
    window.scrollTo(0, 0)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) heroIntro.k = 0
    const tasks: Promise<unknown>[] = [
      import('../three/HeroScene'),
      document.fonts.ready,
      new Promise((res) => {
        const img = new Image()
        img.onload = img.onerror = () => res(null)
        img.src = '/images/logo-mark-white.png'
      }),
      fetch('/images/logo-dark.svg').catch(() => null),
      fetch('/images/logo-red.svg').catch(() => null),
    ]
    if (!reduced) {
      tasks.push(
        new Promise((res) => {
          window.addEventListener(
            'hero-scene-ready',
            () => res(null),
            { once: true },
          )
        }),
      )
    }

    let done = 0
    tasks.forEach((t) => t.then(() => (done += 1)).catch(() => (done += 1)))

    const start = performance.now()
    let shown = 0
    let finished = false
    let raf = 0

    const finish = () => {
      if (finished) return
      finished = true
      setPct(100)
      runTransition()
    }

    const tick = () => {
      const elapsed = performance.now() - start
      const real = (done / tasks.length) * 100
      const timeCap = Math.min(100, (elapsed / MIN_MS) * 100)
      const target = elapsed > MAX_MS ? 100 : Math.min(real, timeCap)
      shown += (target - shown) * 0.08
      if (target >= 100 && shown > 99.4) shown = 100
      setPct(Math.round(shown))
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown / 100})`
      if (shown >= 100) {
        finish()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const runTransition = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          heroIntro.active = false
          html.style.overflow = ''
          html.classList.remove('is-loading')
          setGone(true)
          window.dispatchEvent(new Event('resize'))
        },
      })
      tl.to(uiRef.current, { opacity: 0, y: 16, duration: 0.45, ease: 'power2.in' })
        .to(glowRef.current, { opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 0.2)
        .to(heroIntro, { k: 0, duration: 1.7, ease: 'power3.inOut' }, 0.35)
        .add(() => startIntro(), 1.3)
    }

    return () => {
      cancelAnimationFrame(raf)
      html.style.overflow = ''
    }
  }, [])

  if (gone) return null

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[300]">
      <div
        ref={glowRef}
        className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_42%,rgba(215,25,32,0.22),transparent_55%)]"
      />

      <div ref={uiRef} className="absolute inset-x-0 bottom-[16%] mx-auto w-[min(70vw,360px)] text-center">
        <div className="mb-4 flex items-end justify-between font-display text-xs font-bold uppercase tracking-[0.3em] text-bone/60">
          <span>{t('Loading')}</span>
          <span className="tabular-nums text-bone">{pct}%</span>
        </div>
        <div className="h-px w-full bg-white/15">
          <div ref={barRef} className="h-px origin-left bg-red shadow-[0_0_12px_rgba(215,25,32,0.9)]" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </div>
  )
}
