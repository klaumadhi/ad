import type { Project } from '../data/content'
import { useIsMobile } from '../hooks/useMedia'
import { useT } from '../i18n'

/** A project screenshot presented inside a soft glass "browser" frame. */
export default function ProjectVisual({ project, className = '' }: { project: Project; className?: string }) {
  const t = useT()
  const isMobile = useIsMobile()
  const src = (isMobile && project.imageMobile) || project.image

  return (
    <div className={`glass-solid relative flex flex-col overflow-hidden rounded-2xl sm:rounded-[1.6rem] ${className}`}>
      <div className="flex shrink-0 items-center gap-1.5 border-b border-bone/[0.06] bg-white/70 px-3.5 py-2.5">
        <span className="h-2 w-2 rounded-full bg-[#ff7a7a]" />
        <span className="h-2 w-2 rounded-full bg-[#ffd26b]" />
        <span className="h-2 w-2 rounded-full bg-[#5ce0a0]" />
        <span className="ml-3 hidden truncate rounded-full bg-bone/[0.05] px-3 py-1 font-mono text-[0.6rem] text-bone/45 sm:block">
          {project.name}
        </span>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-charcoal-2/40">
        {src ? (
          <img
            src={src}
            alt={`${project.name} — project preview`}
            className="project-shot absolute inset-0 h-full w-full scale-[1.12] object-cover object-top"
            loading="lazy"
          />
        ) : project.logo ? (
          <div className="absolute inset-0 flex items-center justify-center p-10">
            <img src={project.logo} alt={`${project.name} logo`} className="max-h-[55%] max-w-[70%] object-contain" loading="lazy" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/15 via-white to-accent-2/15">
            <span className="gradient-text font-display text-7xl font-semibold">{project.name.charAt(0)}</span>
          </div>
        )}

        <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-widest text-bone/70 shadow-[0_6px_18px_-8px_rgba(70,60,200,0.5)] backdrop-blur-md">
          {project.live && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2fd08a] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2fd08a]" />
            </span>
          )}
          {project.live ? t('Live Project') : t('Real Screenshot')}
        </span>
      </div>
    </div>
  )
}
