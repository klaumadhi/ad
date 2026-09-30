import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Project } from '../data/content'
import { useContent, useT } from '../i18n'
import ProjectVisual from '../components/ProjectVisual'
import { useIsMobile, useReducedMotion } from '../hooks/useMedia'
import ProjectCaseStudy from '../components/ProjectCaseStudy'

gsap.registerPlugin(ScrollTrigger)

function FeaturedPanel({
  project,
  index,
  onOpen,
  panelClass,
}: {
  project: Project
  index: number
  onOpen: (id: string) => void
  panelClass: string
}) {
  const t = useT()
  return (
    <article className={panelClass}>
      <div className="relative grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-14">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-2 -top-10 select-none font-display text-[9rem] font-semibold leading-none tracking-tighter text-accent/[0.08] sm:text-[13rem] md:-top-24"
        >
          0{index + 1}
        </span>

        <div className="relative order-2 md:order-1">
          <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-bone/45">{project.industry}</p>
          <h3 className="mt-3 font-display text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-bone sm:text-6xl md:text-7xl">
            {project.name}
          </h3>
          <p className="gradient-text mt-3 inline-block text-sm font-semibold tracking-wide">{project.type}</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-bone/60 sm:text-base">{project.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="reveal-tag rounded-full bg-white/70 px-3 py-1 font-mono text-[0.62rem] font-medium uppercase tracking-wider text-bone/55 ring-1 ring-bone/[0.07]"
              >
                {tech}
              </span>
            ))}
          </div>

          <button
            data-cursor="Open"
            onClick={() => onOpen(project.id)}
            className="btn-primary group mt-8 inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[0.82rem] font-semibold"
          >
            {t('View Project')}
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </button>
        </div>

        <button
          data-cursor="Open"
          onClick={() => onOpen(project.id)}
          className="relative order-1 aspect-[4/3] w-full transition-transform duration-700 hover:-rotate-1 hover:scale-[1.02] md:order-2"
        >
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-accent/25 via-accent-3/20 to-accent-2/25 blur-2xl" />
          <ProjectVisual project={project} className="h-full w-full" />
        </button>
      </div>
    </article>
  )
}

function SecondaryPanel({
  panelClass,
  onOpen,
  secondary,
}: {
  panelClass: string
  onOpen: (id: string) => void
  secondary: Project[]
}) {
  const t = useT()
  return (
    <article className={panelClass}>
      <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-bone/45">{t('More Work')}</p>
      <h3 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.04em] text-bone sm:text-4xl md:text-5xl">
        {t('Also Shipped')}
      </h3>
      <div className="mt-9 grid gap-6 sm:grid-cols-3">
        {secondary.map((project) => (
          <button key={project.id} data-cursor="Open" onClick={() => onOpen(project.id)} className="group text-left">
            <ProjectVisual
              project={project}
              className="aspect-[4/3] w-full transition-transform duration-500 group-hover:-translate-y-1.5"
            />
            <p className="mt-4 font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-bone/45">{project.industry}</p>
            <h4 className="mt-1 font-display text-xl font-semibold tracking-tight text-bone transition-colors group-hover:text-accent">
              {project.name}
            </h4>
            <p className="mt-1 text-xs text-bone/50">{project.type}</p>
          </button>
        ))}
      </div>
    </article>
  )
}

export default function Work() {
  const { projects } = useContent()
  const t = useT()
  const featured = projects.filter((p) => p.featured)
  const secondary = projects.filter((p) => !p.featured)
  const panelCount = featured.length + 1
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const reduced = useReducedMotion()

  useEffect(() => {
    const track = trackRef.current
    const section = sectionRef.current
    if (!track || !section) return

    if (isMobile) {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('article', track).forEach((article) => {
          gsap.fromTo(
            article,
            { opacity: 0, y: 50, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: { trigger: article, start: 'top 88%' },
            },
          )
          gsap.utils.toArray<HTMLElement>('.reveal-tag', article).forEach((tag, j) => {
            gsap.fromTo(
              tag,
              { opacity: 0, scale: 0.85 },
              {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                delay: 0.15 + j * 0.05,
                ease: 'power2.out',
                scrollTrigger: { trigger: article, start: 'top 88%' },
              },
            )
          })
        })
      }, section)
      return () => ctx.revert()
    }

    if (reduced) return

    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - window.innerWidth

      const st = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setActiveIndex(Math.min(panelCount - 1, Math.round(self.progress * (panelCount - 1))))
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`
          },
        },
      })

      // Screenshots drift inside their frames as each panel slides past.
      gsap.utils.toArray<HTMLElement>('.project-shot', track).forEach((img) => {
        const panel = img.closest('article')
        if (!panel) return
        gsap.fromTo(
          img,
          { xPercent: -5 },
          {
            xPercent: 5,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: st,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        )
      })
    }, section)

    return () => ctx.revert()
  }, [isMobile, reduced, panelCount])

  const openProject = (id: string) => setSelected(id)

  const panelClass = isMobile
    ? 'w-full px-6 py-14'
    : 'flex h-full w-screen shrink-0 flex-col justify-center px-6 pt-16 sm:px-10 md:px-16'

  return (
    <>
      <section id="work" ref={sectionRef} className="relative w-full">
        <div className={isMobile ? 'relative w-full' : 'relative h-[100svh] w-full overflow-hidden'}>
          <div
            className={`${isMobile ? 'relative' : 'pointer-events-none absolute left-0 right-0 top-0'} z-10 flex items-end justify-between px-6 pt-24 sm:px-10 sm:pt-28`}
          >
            <div>
              <span className="eyebrow eyebrow-line">{t('Selected Work')}</span>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] text-bone sm:text-5xl md:text-6xl">
                {t('Case Studies')}
              </h2>
            </div>
            {!isMobile && (
              <div className="flex flex-col items-end gap-3">
                <span className="font-mono text-xs tabular-nums text-bone/50">
                  0{activeIndex + 1} / 0{panelCount}
                </span>
                <div className="h-[3px] w-40 overflow-hidden rounded-full bg-bone/10">
                  <div
                    ref={barRef}
                    className="h-full origin-left rounded-full bg-gradient-to-r from-accent to-accent-2"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div ref={trackRef} className={isMobile ? 'flex w-full flex-col' : 'flex h-full w-max will-change-transform'}>
            {featured.map((project, i) => (
              <FeaturedPanel key={project.id} project={project} index={i} onOpen={openProject} panelClass={panelClass} />
            ))}
            <SecondaryPanel panelClass={panelClass} onOpen={openProject} secondary={secondary} />
          </div>
        </div>
      </section>

      <ProjectCaseStudy project={projects.find((p) => p.id === selected) ?? null} onClose={() => setSelected(null)} />
    </>
  )
}
