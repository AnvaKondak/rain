import { useSyncExternalStore } from 'react'

// Day/night: follows the system until the switch is used, then remembers the
// choice on this device. Stored in localStorage so index.html can apply it
// before first paint (no flash of the wrong theme).

export type Theme = 'light' | 'dark'

const KEY = 'rain.theme'
const COLORS: Record<Theme, string> = { light: '#fbf6f1', dark: '#1b1a33' }
const systemDark = matchMedia('(prefers-color-scheme: dark)')
const listeners = new Set<() => void>()

function chosen(): Theme | null {
  const t = document.documentElement.dataset.theme
  return t === 'light' || t === 'dark' ? t : null
}

function current(): Theme {
  return chosen() ?? (systemDark.matches ? 'dark' : 'light')
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  systemDark.addEventListener('change', listener)
  return () => {
    listeners.delete(listener)
    systemDark.removeEventListener('change', listener)
  }
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, current)
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  // Match the browser/status bar colour too.
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', COLORS[theme]))
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // Remembering is a nicety; the switch still works for this visit.
  }
  listeners.forEach((l) => l())
}
