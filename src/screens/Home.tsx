import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { startAmbient, stopAmbient } from '../audio/ambient.ts'
import Lotus from '../components/Lotus.tsx'
import ThemeSwitch from '../components/ThemeSwitch.tsx'
import { useSettings } from '../db/settings.ts'
import { startDraft } from '../session/draft.ts'
import './Home.css'

// The lotus rises out of the water only the first time Home appears after
// the app opens, not every time you come back to it.
let hasRisen = false

const icon = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function PondIcon() {
  return (
    <svg {...icon}>
      <path d="M12 16c-2.6-1.4-3.6-4-2.6-7.6 1.6 1 2.6 2.4 2.6 4.1 0-1.7 1-3.1 2.6-4.1 1 3.6 0 6.2-2.6 7.6Z" />
      <path d="M12 16c-3-.2-5.4-1.7-6.4-4.2 2.2-.3 3.9.3 5 1.6M12 16c3-.2 5.4-1.7 6.4-4.2-2.2-.3-3.9.3-5 1.6" />
      <path d="M4 19.5c2.7 1 13.3 1 16 0" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg {...icon}>
      <path d="M5 7h9M18 7h1M5 12h3M12 12h7M5 17h7M16 17h3" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="14" cy="17" r="2" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg {...icon}>
      <path d="M12 7c-2-1.6-4.8-2-8-1.5v12c3.2-.5 6 0 8 1.5 2-1.5 4.8-2 8-1.5v-12c-3.2-.5-6-.1-8 1.5Z" />
      <path d="M12 7v12" />
    </svg>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const settings = useSettings()
  const [rise] = useState(() => !hasRisen)
  useEffect(() => {
    hasRisen = true
  }, [])

  // Back on Home means no session is running (e.g. left with the browser's
  // back button), so let any ambient sound fade away.
  useEffect(() => stopAmbient(), [])

  return (
    <main className="home">
      <div className="home-stars" aria-hidden="true" />
      <div className="home-center">
        <Lotus stage="bloom" onWater rise={rise} />
        <p className="home-tagline">This meditation follows RAIN, a practice popularized by Tara Brach: Recognize, Allow, Investigate, Nurture.</p>
        <button
          type="button"
          className="btn-begin"
          onClick={() => {
            startDraft()
            // Started inside the tap: iOS only allows audio to begin from a user gesture.
            if (settings.ambientEnabled) startAmbient(settings.ambientSound, settings.ambientVolume)
            navigate('/practice/arrive')
          }}
        >
          Begin RAIN meditation
        </button>
      </div>
      <nav className="home-links" aria-label="More">
        <Link className="home-link" to="/history">
          <PondIcon />
          <span>Pond</span>
        </Link>
        <Link className="home-link" to="/settings">
          <SettingsIcon />
          <span>Settings</span>
        </Link>
        <Link className="home-link" to="/learn">
          <BookIcon />
          <span>About RAIN</span>
        </Link>
      </nav>
      <div className="home-theme">
        <ThemeSwitch />
      </div>
    </main>
  )
}
