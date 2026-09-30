/** The AD monogram — the real artwork, with its eye highlights and shaded feathers intact. */
export default function Logo({ className = '', title = 'Authentic Dev' }: { className?: string; title?: string }) {
  return (
    <img
      src="/images/logo-mark-transparent.png"
      alt={title}
      width={1064}
      height={635}
      draggable={false}
      className={`aspect-[1064/635] w-auto select-none object-contain ${className}`}
    />
  )
}
