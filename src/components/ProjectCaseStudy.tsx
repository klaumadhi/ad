import { useEffect } from 'react'
import { getLenis } from '../hooks/useLenis'
import { AnimatePresence, motion } from 'framer-motion'
import type { Project } from '../data/content'
import ProjectVisual from './ProjectVisual'

const fields: { key: keyof Project; label: string }[] = [
  { key: 'challenge', label: 'Challenge' },
  { key: 'solution', label: 'Solution' },
  { key: 'result', label: 'Result' },
]

const fieldVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

export default function ProjectCaseStudy({ project, onClose }: { project: Project | null; onClose: () => void }) {
  useEffect(() => {
    if (!project) return
    const lenis = getLenis()
    lenis?.stop()
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
      lenis?.start()
    }
  }, [project])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          data-lenis-prevent
          data-lenis-prevent-wheel
          data-lenis-prevent-touch
          className="fixed inset-0 z-[110] overflow-y-auto overscroll-contain bg-void/95 backdrop-blur-xl"
        >
          <div className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
            <button
              data-cursor="Close"
              onClick={onClose}
              className="fixed right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-bone hover:border-red hover:text-red transition-colors"
              aria-label="Close case study"
            >
              ✕
            </button>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="eyebrow eyebrow-line">{project.industry}</span>
              <h3 className="mt-5 font-display text-5xl sm:text-6xl md:text-7xl font-black uppercase leading-[0.92] tracking-tight text-bone">
                {project.name}
              </h3>
              <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-red">{project.type}</p>

              <ProjectVisual project={project} className="mt-10 aspect-[16/9] w-full" />

              <div className="mt-12 grid gap-10 sm:grid-cols-3">
                {fields.map((f, i) => (
                  <motion.div key={f.key} custom={i} variants={fieldVariants} initial="hidden" animate="show">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-bone/40">
                      {f.label}
                    </span>
                    <p className="mt-3 text-sm sm:text-base text-bone/70 leading-relaxed">{project[f.key]}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mt-10"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
              >
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-bone/40">Technology</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tech.map((t, i) => (
                    <motion.span
                      key={t}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.6 + i * 0.05 }}
                      className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-bone/50"
                    >
                      {t}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
