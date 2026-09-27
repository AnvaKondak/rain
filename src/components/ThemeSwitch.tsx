import { setTheme, useTheme } from '../lib/theme.ts'
import './ThemeSwitch.css'

/** A tiny day/night switch: sun on the left, moon on the right. */
export default function ThemeSwitch() {
  const night = useTheme() === 'dark'
  return (
    <button
      type="button"
      role="switch"
      className="theme-switch"
      aria-checked={night}
      aria-label="Night mode"
      onClick={() => setTheme(night ? 'light' : 'dark')}
    >
      <svg className="theme-icon theme-icon--sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
      </svg>
      <svg className="theme-icon theme-icon--moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" />
      </svg>
      <span className="theme-thumb" />
    </button>
  )
}
