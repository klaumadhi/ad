import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as data from '../data/content'
import { sq } from './sq'

export type Lang = 'en' | 'sq'

const STORAGE_KEY = 'ad-lang'

function readCookie(name: string) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : null
}

/**
 * Language resolution order:
 *  1. the visitor's own choice (language switch)
 *  2. the country resolved at the edge (Netlify sets an `ad_geo` cookie): AL -> Albanian, anything else -> English
 *  3. fallbacks when no geo cookie exists (local dev): Albanian timezone, then browser language
 */
export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'sq') return saved
  } catch {
    /* storage unavailable */
  }
  const geo = readCookie('ad_geo')
  if (geo) return geo.toUpperCase() === 'AL' ? 'sq' : 'en'
  try {
    if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Tirane') return 'sq'
  } catch {
    /* ignore */
  }
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  return langs.some((l) => l?.toLowerCase().startsWith('sq')) ? 'sq' : 'en'
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (s: string, ctx?: string) => string }
const LangContext = createContext<Ctx>({ lang: 'en', setLang: () => {}, t: (s) => s })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  // `ctx` lets one English string read differently in Albanian where it is used (key: "ctx|English").
  const t = useCallback((s: string, ctx?: string) => (lang === 'sq' ? ((ctx && sq[`${ctx}|${s}`]) || sq[s] || s) : s), [lang])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = lang === 'sq' ? 'AUTHENTIC DEV — Studio Shqiptare e Zhvillimit Web' : 'AUTHENTIC DEV — Albanian Web Development Studio'
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
export const useT = () => useContext(LangContext).t

function deepT<T>(value: T, t: (s: string) => string): T {
  if (typeof value === 'string') return t(value) as unknown as T
  if (Array.isArray(value)) return value.map((v) => deepT(v, t)) as unknown as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      // Identifiers, paths and colours are never translated.
      out[k] = ['id', 'accent', 'image', 'imageMobile', 'logo', 'href', 'index'].includes(k) ? v : deepT(v, t)
    }
    return out as T
  }
  return value
}

/** Site content (services, projects, …) in the active language. */
export function useContent() {
  const { t, lang } = useContext(LangContext)
  return useMemo(
    () => ({
      navLinks: deepT(data.navLinks, t),
      services: deepT(data.services, t),
      projects: deepT(data.projects, t),
      technologies: deepT(data.technologies, t),
      processSteps: deepT(data.processSteps, t),
      ecosystemItems: deepT(data.ecosystemItems, t),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang],
  )
}
