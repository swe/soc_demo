'use client'

import Icon from '@/components/ui/icon'
import { useTheme } from '@/lib/theme'

/**
 * Compact header theme toggle — switches between light and dark. System
 * preference remains available in Settings; both themes are first-class.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  // resolvedTheme is undefined until the provider hydrates — render a
  // placeholder of identical size so the header never shifts.
  if (!resolvedTheme) {
    return <div className="h-7 w-7" aria-hidden />
  }

  const next = resolvedTheme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      data-testid="theme-toggle"
      className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)]
        text-[color:var(--soc-text-muted)] transition-colors duration-[var(--duration-fast)]
        hover:bg-[color:var(--soc-hover)] hover:text-[color:var(--soc-text)]"
      aria-label={`Switch to ${next} theme`}
    >
      <Icon
        name={resolvedTheme === 'dark' ? 'sunny-outline' : 'moon-outline'}
        className="w-4 h-4"
      />
    </button>
  )
}
