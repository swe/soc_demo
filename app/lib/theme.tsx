'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { THEME_STORAGE_KEY } from './theme-script'

const CLASS_NAMES = ['light', 'dark'] as const
type Resolved = 'light' | 'dark'
type ThemeName = 'light' | 'dark' | 'system'

export type ThemeContextValue = {
  theme?: string
  setTheme: (value: string | ((prev: string | undefined) => string)) => void
  resolvedTheme?: Resolved
  systemTheme?: Resolved
  themes: string[]
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): Resolved {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: ThemeName): Resolved {
  return theme === 'system' ? getSystemTheme() : theme
}

function applyThemeClass(resolved: Resolved) {
  const root = document.documentElement
  root.classList.remove(...CLASS_NAMES)
  root.classList.add(resolved)
  root.style.colorScheme = resolved === 'dark' ? 'dark' : 'light'
}

export function ThemeProvider({
  children,
  disableTransitionOnChange = false,
  defaultTheme = 'system',
  enableSystem = true,
  storageKey = THEME_STORAGE_KEY,
}: {
  children: ReactNode
  attribute?: 'class' | string
  disableTransitionOnChange?: boolean
  defaultTheme?: string
  enableSystem?: boolean
  storageKey?: string
  themes?: string[]
  forcedTheme?: string
  enableColorScheme?: boolean
  nonce?: string
}) {
  const [theme, setThemeState] = useState<string | undefined>(undefined)
  const [resolvedTheme, setResolvedTheme] = useState<Resolved | undefined>(undefined)
  const [systemTheme, setSystemTheme] = useState<Resolved | undefined>(undefined)

  useEffect(() => {
    let stored: ThemeName = (defaultTheme as ThemeName) || 'system'
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw === 'light' || raw === 'dark' || raw === 'system') stored = raw
    } catch {
      // ignore
    }
    if (!enableSystem && stored === 'system') stored = 'light'
    setThemeState(stored)
  }, [defaultTheme, enableSystem, storageKey])

  const applyWithTransitionGuard = useCallback(
    (fn: () => void) => {
      if (!disableTransitionOnChange) {
        fn()
        return
      }
      const s = document.createElement('style')
      s.setAttribute('data-theme-transition', '')
      s.appendChild(
        document.createTextNode(
          '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}'
        )
      )
      document.head.appendChild(s)
      fn()
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          s.remove()
        })
      })
    },
    [disableTransitionOnChange]
  )

  useEffect(() => {
    if (theme === undefined) return
    const sys = getSystemTheme()
    setSystemTheme(sys)
    const resolved = resolveTheme(theme as ThemeName)
    setResolvedTheme(resolved)
    applyWithTransitionGuard(() => applyThemeClass(resolved))
  }, [theme, applyWithTransitionGuard])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const sys = getSystemTheme()
      setSystemTheme(sys)
      setResolvedTheme(sys)
      applyWithTransitionGuard(() => applyThemeClass(sys))
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme, applyWithTransitionGuard])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey || !e.newValue) return
      if (e.newValue === 'light' || e.newValue === 'dark' || e.newValue === 'system') {
        setThemeState(e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [storageKey])

  const setTheme = useCallback(
    (value: string | ((prev: string | undefined) => string)) => {
      setThemeState((prev) => {
        const next = typeof value === 'function' ? (value as (p: string | undefined) => string)(prev) : value
        try {
          localStorage.setItem(storageKey, next)
        } catch {
          // ignore
        }
        return next
      })
    },
    [storageKey]
  )

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
      themes: enableSystem ? [...CLASS_NAMES, 'system'] : [...CLASS_NAMES],
    }),
    [theme, setTheme, resolvedTheme, systemTheme, enableSystem]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    return {
      theme: undefined,
      setTheme: () => {},
      resolvedTheme: undefined,
      systemTheme: undefined,
      themes: [],
    }
  }
  return ctx
}
