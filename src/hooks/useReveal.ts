import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FROM: Record<string, gsap.TweenVars> = {
  up: { y: 46, opacity: 0 },
  fade: { opacity: 0 },
  scale: { scale: 0.9, y: 26, opacity: 0 },
  left: { x: -80, opacity: 0 },
  right: { x: 80, opacity: 0 },
  blur: { y: 30, opacity: 0, filter: 'blur(14px)' },
  rise: { y: 100, opacity: 0, scale: 0.95 },
  tilt: { y: 70, opacity: 0, rotateX: 14, transformPerspective: 900, transformOrigin: '50% 100%' },
}

/**
 * Declarative scroll animation for a section. Inside `scope`:
 *   data-reveal="up|fade|scale|left|right|blur|rise|tilt"  (+ data-delay="0.2")  animates the element in once
 *   data-stagger="up|scale|…" (+ data-each="0.08")                                  staggers the element's children
 *   data-parallax="0.15"                                                             drifts the element against the scroll
 */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const root = scope.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]', root).forEach((el) => {
        const from = FROM[el.dataset.reveal || 'up'] ?? FROM.up
        gsap.from(el, {
          ...from,
          duration: 1.15,
          delay: parseFloat(el.dataset.delay || '0'),
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-stagger]', root).forEach((group) => {
        const from = FROM[group.dataset.stagger || 'up'] ?? FROM.up
        gsap.from(Array.from(group.children), {
          ...from,
          duration: 0.95,
          stagger: parseFloat(group.dataset.each || '0.09'),
          ease: 'power3.out',
          scrollTrigger: { trigger: group, start: 'top 88%', once: true },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-parallax]', root).forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || '0.1')
        gsap.fromTo(
          el,
          { y: -speed * 140 },
          {
            y: speed * 140,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    }, root)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
