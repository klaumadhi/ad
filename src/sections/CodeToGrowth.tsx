import { lazy, Suspense, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsTouch, useReducedMotion } from '../hooks/useMedia'

const JourneyScene = lazy(() => import('../three/JourneyScene'))

gsap.registerPlugin(ScrollTrigger)

const businessNodes = ['Customers', 'Orders', 'Payments', 'Inventory', 'Analytics']

function MobileJourney() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.mj-stage').forEach((stage, i) => {
        gsap.fromTo(
          stage,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: stage, start: 'top 82%' },
          },
        )
        gsap.utils.toArray<HTMLElement>('.mj-item', stage).forEach((item, j) => {
          gsap.fromTo(
            item,
            { opacity: 0, y: 16, scale: 0.94 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              delay: 0.1 + j * 0.06,
              ease: 'power3.out',
              scrollTrigger: { trigger: stage, start: 'top 82%' },
            },
          )
        })
        // Progress connector line grows as each stage settles in.
        const line = stage.querySelector('.mj-line')
        if (line) {
          gsap.fromTo(
            line,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 0.8,
              ease: 'power2.out',
              transformOrigin: 'top',
              scrollTrigger: { trigger: stage, start: 'top 70%', end: 'bottom 60%', scrub: 0.4 },
            },
          )
        }
        void i
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-void py-24" aria-label="From code to growth — how a project comes together">
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative z-10 mx-auto max-w-md px-6">
        <span className="eyebrow eyebrow-line">From Code To Growth</span>
        <h2 className="mt-5 font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-bone">
          How A Project <span className="text-red">Comes Together.</span>
        </h2>

        <div className="mt-16 space-y-2">
          {/* Stage 1: Brand */}
          <div className="mj-stage relative pl-8">
            <span className="mj-line absolute left-0 top-2 h-full w-px bg-gradient-to-b from-red to-transparent" aria-hidden />
            <span className="mj-item absolute -left-[5px] top-1 h-3 w-3 rounded-full border-2 border-red bg-void" aria-hidden />
            <div className="mj-item pb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-red">01 — Idea</span>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-charcoal/60 p-4">
                <img src="/images/logo-mark-white.png" alt="Authentic Dev" className="h-9 w-auto" />
                <p className="text-sm text-bone/60">An Albanian identity, rebuilt as a digital product.</p>
              </div>
            </div>
          </div>

          {/* Stage 2: Code */}
          <div className="mj-stage relative pl-8">
            <span className="mj-line absolute left-0 top-2 h-full w-px bg-gradient-to-b from-red to-transparent" aria-hidden />
            <span className="mj-item absolute -left-[5px] top-1 h-3 w-3 rounded-full border-2 border-red bg-void" aria-hidden />
            <div className="mj-item pb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-red">02 — Code</span>
              <div className="mt-4 rounded-xl border border-white/10 bg-void p-4 font-mono text-[11px] leading-relaxed text-bone/70">
                <span className="text-[#6b7280]">{'// authentic-dev/product.ts'}</span>
                {'\n'}
                <span className="text-red">const</span> product = {'{'}
                {'\n  interface: '}
                <span className="text-[#8fd19e]">"modern"</span>,{'\n  scalable: '}
                <span className="text-[#6fb8ff]">true</span>
                {'\n}'}
              </div>
            </div>
          </div>

          {/* Stage 3: Website */}
          <div className="mj-stage relative pl-8">
            <span className="mj-line absolute left-0 top-2 h-full w-px bg-gradient-to-b from-red to-transparent" aria-hidden />
            <span className="mj-item absolute -left-[5px] top-1 h-3 w-3 rounded-full border-2 border-red bg-void" aria-hidden />
            <div className="mj-item pb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-red">03 — Product</span>
              <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-void p-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-bone">Authentic Dev</span>
                  <span className="rounded-full bg-red px-2 py-0.5 text-[8px] font-bold uppercase text-white">Let's Talk</span>
                </div>
                <div className="mt-3 h-2 w-2/3 rounded bg-bone/70" />
                <div className="mt-2 h-2 w-1/2 rounded bg-red" />
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  <div className="h-8 rounded border border-white/10 bg-charcoal" />
                  <div className="h-8 rounded border border-white/10 bg-charcoal" />
                  <div className="h-8 rounded border border-white/10 bg-charcoal" />
                </div>
              </div>
            </div>
          </div>

          {/* Stage 4: Business */}
          <div className="mj-stage relative pl-8">
            <span className="mj-item absolute -left-[5px] top-1 h-3 w-3 rounded-full border-2 border-red bg-void" aria-hidden />
            <div className="mj-item">
              <span className="text-xs font-bold uppercase tracking-widest text-red">04 — Business</span>
              <div className="mt-4 flex flex-wrap gap-2">
                {businessNodes.map((node) => (
                  <span
                    key={node}
                    className="mj-item rounded-full border border-red/30 bg-charcoal/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-bone/80"
                  >
                    {node}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mj-stage mt-6 text-center">
          <div className="mj-item">
            <h3 className="font-display text-3xl font-black uppercase leading-[0.95] tracking-tight text-bone">
              From Code <span className="block text-red">To Growth.</span>
            </h3>
            <p className="mt-4 text-sm text-bone/55">
              We build digital products that help businesses move forward.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CodeToGrowth() {
  const sectionRef = useRef<HTMLElement>(null)
  const progressRef = useRef(0)
  const isTouch = useIsTouch()
  const reduced = useReducedMotion()

  const heritageLabelRef = useRef<HTMLDivElement>(null)
  const gridLabelRef = useRef<HTMLDivElement>(null)
  const businessRef = useRef<HTMLDivElement>(null)
  const finalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 4.2}`,
          scrub: 0.35,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        },
      })

      tl.set([heritageLabelRef.current, gridLabelRef.current, businessRef.current, finalRef.current], { opacity: 0 })
        .set(finalRef.current, { opacity: 0, scale: 0.94 })
        // Eagle close-up label.
        .to(heritageLabelRef.current, { opacity: 1, duration: 0.05 }, 0.04)
        .to(heritageLabelRef.current, { opacity: 0, duration: 0.04 }, 0.12)
        // Digital grid reveal label.
        .to(gridLabelRef.current, { opacity: 1, duration: 0.05 }, 0.17)
        .to(gridLabelRef.current, { opacity: 0, duration: 0.05 }, 0.3)
        // The 3D laptop (code → website) drives itself off progressRef inside the
        // WebGL scene — only the business layer and final headline are DOM overlays.
        .fromTo(businessRef.current, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.08 }, 0.81)
        .to(businessRef.current, { opacity: 0, scale: 1.08, duration: 0.05 }, 0.9)
        .to(finalRef.current, { opacity: 1, scale: 1, duration: 0.07 }, 0.94)
    }, section)

    return () => ctx.revert()
  }, [reduced])

  if (reduced) {
    return <MobileJourney />
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden bg-void"
      aria-label="From code to growth — how a project comes together"
    >
      <Suspense fallback={<div className="absolute inset-0 bg-void" />}>
        <JourneyScene progressRef={progressRef} isTouch={isTouch} />
      </Suspense>

      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-20" />

      <div className="pointer-events-none absolute inset-0 z-10">
        <div ref={heritageLabelRef} className="absolute left-1/2 top-[16%] -translate-x-1/2 text-center opacity-0">
          <span className="eyebrow">Albanian Heritage, Rebuilt In Code</span>
        </div>

        <div ref={gridLabelRef} className="absolute left-1/2 top-[16%] -translate-x-1/2 text-center opacity-0">
          <span className="eyebrow">A Digital Foundation</span>
        </div>

        {/* Business ecosystem chips */}
        <div ref={businessRef} className="absolute inset-0 flex flex-col items-center justify-end gap-6 pb-[14%] opacity-0">
          <span className="eyebrow eyebrow-line">The Product Becomes A Business</span>
          <div className="flex flex-wrap justify-center gap-3 px-6">
            {businessNodes.map((node) => (
              <span
                key={node}
                className="rounded-full border border-red/30 bg-charcoal/80 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-bone/80 backdrop-blur-sm"
              >
                {node}
              </span>
            ))}
          </div>
        </div>

        {/* Return to brand */}
        <div ref={finalRef} className="absolute inset-0 flex flex-col items-center justify-end pb-20 text-center opacity-0">
          <h2 className="font-display text-[11vw] sm:text-[7vw] md:text-6xl font-black uppercase leading-[0.95] tracking-tight text-bone">
            <span className="block">From Code</span>
            <span className="block text-red">To Growth.</span>
          </h2>
          <p className="mt-5 max-w-md px-6 text-sm sm:text-base text-bone/55">
            We build digital products that help businesses move forward.
          </p>
        </div>
      </div>
    </section>
  )
}
