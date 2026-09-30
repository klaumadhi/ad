import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsMobile } from './useMedia'

gsap.registerPlugin(ScrollTrigger)

const FROM: Record<string, gsap.TweenVars> = {
  up: { y: 46, opacity: 0 },
  fade: { opacity: 0 },
  scale: { scale: 0.9, y: 26, opacity: 0 },
  left: { x: -90, opacity: 0 },
  right: { x: 90, opacity: 0 },
  blur: { y: 30, opacity: 0, filter: 'blur(14px)' },
  rise: { y: 100, opacity: 0, scale: 0.95 },
  tilt: { y: 70, opacity: 0, rotateX: 14, transformPerspective: 900, transformOrigin: '50% 100%' },
  flip: { y: 50, opacity: 0, rotateX: -80, transformPerspective: 800, transformOrigin: '50% 0%' },
  zoom: { scale: 0.55, opacity: 0 },
  spin: { rotate: -9, scale: 0.85, y: 60, opacity: 0 },
  skew: { skewY: 7, y: 70, opacity: 0 },
}

/**
 * Declarative scroll animation for a section. Inside `scope`:
 *   data-reveal="up|fade|scale|left|right|blur|rise|tilt|flip|zoom|spin|skew"  (+ data-delay="0.2")
 *   data-stagger="…" (+ data-each="0.08")     staggers the element's children
 *   data-parallax="0.15"                       drifts the element against the scroll
 * On phones, `data-reveal-m` / `data-stagger-m` override the variant ("alt" makes a list's items
 * alternate in from the left and right), every item animates on its own as it reaches the viewport,
 * and all of it is reversible — scrolling back up plays the animation backwards.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  const isMobile = useIsMobile()

  useEffect(() => {
    const root = scope.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const st = (trigger: Element, start: string): ScrollTrigger.Vars =>
      isMobile
        ? { trigger, start, toggleActions: 'play none none reverse' }
        : { trigger, start, once: true }

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]', root).forEach((el) => {
        const kind = (isMobile && el.dataset.revealM) || el.dataset.reveal || 'up'
        gsap.from(el, {
          ...(FROM[kind] ?? FROM.up),
          duration: 1.1,
          delay: parseFloat(el.dataset.delay || '0'),
          ease: 'power3.out',
          scrollTrigger: st(el, 'top 90%'),
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-stagger]', root).forEach((group) => {
        const kind = (isMobile && group.dataset.staggerM) || group.dataset.stagger || 'up'
        const items = Array.from(group.children) as HTMLElement[]

        if (isMobile) {
          // Vertical stacks read best when each item animates as it arrives.
          items.forEach((item, i) => {
            const from =
              kind === 'alt' ? { x: i % 2 === 0 ? -110 : 110, opacity: 0, rotate: i % 2 === 0 ? -3 : 3 } : (FROM[kind] ?? FROM.up)
            gsap.from(item, {
              ...from,
              duration: 0.95,
              delay: (i % 2) * 0.06,
              ease: 'power3.out',
              scrollTrigger: st(item, 'top 92%'),
            })
          })
          return
        }

        gsap.from(items, {
          ...(FROM[kind] ?? FROM.up),
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
  }, [isMobile, ...deps])
}
