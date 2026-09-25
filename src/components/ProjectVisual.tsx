import type { Project } from '../data/content'
import { useIsMobile } from '../hooks/useMedia'
import { useT } from '../i18n'

export default function ProjectVisual({ project, className = '' }: { project: Project; className?: string }) {
  const t = useT()
  const isMobile = useIsMobile()
  const src = (isMobile && project.imageMobile) || project.image

  if (src) {
    return (
      <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 ${className}`}>
        <img
          src={src}
          alt={`${project.name} — project preview`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-void/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-void/50 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-widest text-bone/60 backdrop-blur-sm">
          {project.live ? t('Live Project') : t('Real Screenshot')}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 ${className}`}
      style={{
        background: `radial-gradient(120% 120% at 15% 10%, ${project.accent}22 0%, #111318 55%, #0a0b0d 100%)`,
      }}
    >
      <div className="grid-backdrop absolute inset-0 opacity-30" />

      {project.logo ? (
        <div className="absolute inset-0 flex items-center justify-center p-10 sm:p-14">
          <img
            src={project.logo}
            alt={`${project.name} logo`}
            className="max-h-[55%] w-full max-w-[70%] object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className="absolute -bottom-[18%] -right-[8%] select-none font-display font-black leading-none opacity-[0.14]"
          style={{ fontSize: '52vw', color: project.accent }}
          aria-hidden
        >
          {project.name.charAt(0)}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent" />
      <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-void/50 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-widest text-bone/50 backdrop-blur-sm">
        {project.logo ? t('Real Brand') : t('Preview — placeholder')}
      </span>
    </div>
  )
}
