import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Project } from '../data/content'
import { useContent, useT } from '../i18n'
import ProjectVisual from '../components/ProjectVisual'
import { useIsMobile, useReducedMotion } from '../hooks/useMedia'
import ProjectCaseStudy from '../components/ProjectCaseStudy'

gsap.registerPlugin(ScrollTrigger)


function FeaturedPanel({ project, onOpen, panelClass }: { project: Project; onOpen: (id: string) => void; panelClass: string }) {
  const t = useT()
  return (
    <article className={panelClass}>
      <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-14">
        <div className="order-2 md:order-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-bone/40">{project.industry}</p>
          <h3 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.95] tracking-tight text-bone">
            {project.name}
          </h3>
          <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-red">{project.type}</p>
          <p className="mt-5 max-w-md text-sm sm:text-base text-bone/55">{project.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="reveal-tag rounded-full border border-white/10 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-bone/45"
              >
                {t}
              </span>
            ))}
          </div>

          <button
            data-cursor="Open"
            onClick={() => onOpen(project.id)}
            className="group mt-7 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-bone hover:text-red transition-colors"
          >
            {t('View Project')}
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
          </button>
        </div>

        <button data-cursor="Open" onClick={() => onOpen(project.id)} className="order-1 aspect-[4/3] w-full md:order-2">
          <ProjectVisual project={project} className="h-full w-full" />
        </button>
      </div>
    </article>
  )
}

function SecondaryPanel({ panelClass, onOpen, secondary }: { panelClass: string; onOpen: (id: string) => void; secondary: Project[] }) {
  const t = useT()
  return (
    <article className={panelClass}>
      <p className="text-xs font-semibold uppercase tracking-widest text-bone/40">{t('More Work')}</p>
      <h3 className="mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase leading-tight tracking-tight text-bone">
        {t('Also Shipped')}
      </h3>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {secondary.map((project) => (
          <button
            key={project.id}
            data-cursor="Open"
            onClick={() => onOpen(project.id)}
            className="group text-left"
          >
            <ProjectVisual project={project} className="aspect-[4/3] w-full" />
            <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-widest text-bone/40">
              {project.industry}
            </p>
            <h4 className="mt-1 font-display text-lg font-bold uppercase tracking-tight text-bone group-hover:text-red transition-colors">
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
        gsap.utils.toArray<HTMLElement>('article', track).forEach((article, i) => {
          gsap.fromTo(
            article,
            { opacity: 0, y: 36 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
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
          void i
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
          },
        },
      })

      return () => {
        st.scrollTrigger?.kill()
      }
    }, section)

    return () => ctx.revert()
  }, [isMobile, reduced])

  const openProject = (id: string) => setSelected(id)

  const panelClass = isMobile
    ? 'w-full px-6 py-14'
    : 'flex h-full w-screen shrink-0 flex-col justify-center px-6 sm:px-10 md:px-16'

  return (
    <>
      <section id="work" ref={sectionRef} className="relative w-full bg-void">
        <div className={isMobile ? 'relative w-full' : 'relative h-[100svh] w-full overflow-hidden'}>
          <div className={`${isMobile ? 'relative' : 'pointer-events-none absolute left-0 right-0 top-0'} z-10 flex items-center justify-between px-6 pt-24 sm:px-10 sm:pt-28`}>
            <div>
              <span className="eyebrow eyebrow-line">{t('Selected Work')}</span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-bone">
                {t('Case Studies')}
              </h2>
            </div>
            {!isMobile && (
              <span className="font-display text-sm tabular-nums text-bone/50">
                0{activeIndex + 1} / 0{panelCount}
              </span>
            )}
          </div>

          <div ref={trackRef} className={isMobile ? 'flex w-full flex-col' : 'flex h-full w-max will-change-transform'}>
            {featured.map((project) => (
              <FeaturedPanel key={project.id} project={project} onOpen={openProject} panelClass={panelClass} />
            ))}
            <SecondaryPanel panelClass={panelClass} onOpen={openProject} secondary={secondary} />
          </div>
        </div>
      </section>

      <ProjectCaseStudy
        project={projects.find((p) => p.id === selected) ?? null}
        onClose={() => setSelected(null)}
      />
    </>
  )
}
