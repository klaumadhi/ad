import { useRef, type ReactNode, type ElementType } from 'react'
import { useIsTouch } from '../hooks/useMedia'

type MagneticButtonProps = {
  as?: ElementType
  children: ReactNode
  strength?: number
  cursorLabel?: string
  className?: string
  [key: string]: unknown
}

export default function MagneticButton({
  as,
  children,
  strength = 0.35,
  cursorLabel,
  className = '',
  ...rest
}: MagneticButtonProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag: any = as || 'button'
  const ref = useRef<HTMLElement>(null)
  const isTouch = useIsTouch()

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isTouch || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }

  const onMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'translate(0, 0)'
  }

  return (
    <Tag
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      data-cursor={cursorLabel}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
