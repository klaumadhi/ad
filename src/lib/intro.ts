export const intro = { started: false }

export function startIntro() {
  if (intro.started) return
  intro.started = true
  window.dispatchEvent(new Event('intro-start'))
}

export function onIntro(cb: () => void) {
  if (intro.started) {
    cb()
    return () => {}
  }
  window.addEventListener('intro-start', cb, { once: true })
  return () => window.removeEventListener('intro-start', cb)
}

/** 1 = preloader framing (logo big and centred), 0 = final hero framing. */
export const heroIntro = { k: 1, active: true }
