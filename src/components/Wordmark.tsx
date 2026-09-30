/** "AUTHENTIC DEV" — navy + brand indigo. One definition so the header and footer always match. */
export default function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`whitespace-nowrap font-display font-semibold uppercase tracking-tight text-bone ${className}`}>
      Authentic <span className="text-accent">Dev</span>
    </span>
  )
}
