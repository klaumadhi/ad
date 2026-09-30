/** The Authentic Dev mark — an eagle head dissolving into pixels (your original artwork, unaltered). */
export default function Logo({ className = '', title = 'Authentic Dev' }: { className?: string; title?: string }) {
  return (
    <img
      src="/images/logo-mark-transparent.png"
      alt={title}
      width={1054}
      height={738}
      draggable={false}
      className={`aspect-[1054/738] w-auto select-none object-contain ${className}`}
    />
  )
}
