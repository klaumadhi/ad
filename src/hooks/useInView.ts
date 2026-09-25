import { useEffect, useRef, useState } from 'react'

/** True while the element is near the viewport — used to pause off-screen WebGL canvases. */
export function useInView<T extends HTMLElement>(margin = '200px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [margin])

  return [ref, inView] as const
}
