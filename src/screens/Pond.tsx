import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import PondView from '../components/PondView.tsx'
import { STEPS } from '../content/steps.ts'
import { db } from '../db/db.ts'
import type { Session } from '../db/types.ts'
import { formatDay, formatTime, isThisWeek } from '../lib/dates.ts'
import { formatMonth, layoutPond, monthKey, monthRange } from '../lib/pond.ts'
import './Pond.css'

const hasText = (s: Session) => STEPS.some((step) => s.steps[step.id].text)

type View = 'pond' | 'list'
const VIEW_KEY = 'rain.pondView'

function readView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'pond'
  } catch {
    return 'pond'
  }
}

export default function Pond() {
  const location = useLocation()
  const navigate = useNavigate()
  const sessions = useLiveQuery(() => db.sessions.orderBy('startedAt').toArray())
  // Set by After the rain: the session whose lotus should drift into place.
  const [arrivingId] = useState<string | undefined>(() => (location.state as { arrived?: string } | null)?.arrived)
  const [view, setView] = useState<View>(readView)
  const [month, setMonth] = useState<string | null>(null)
  const swipe = useRef<{ x: number; y: number; moved: boolean } | null>(null)

  // Welcome it once; don't replay on reload or when coming back from a session.
  useEffect(() => {
    if (arrivingId) navigate(location.pathname, { replace: true, state: null })
  }, [arrivingId, location.pathname, navigate])

  if (!sessions) return null

  const thisWeek = sessions.filter((s) => isThisWeek(s.startedAt)).length
  const current = monthKey(new Date())
  const earliest = sessions[0] ? monthKey(sessions[0].startedAt) : current
  const latest = sessions.at(-1) ? monthKey(sessions.at(-1)!.startedAt) : current
  const months = monthRange(earliest < current ? earliest : current, latest > current ? latest : current)
  const arriving = sessions.find((s) => s.id === arrivingId)
  const shown = month ?? (arriving ? monthKey(arriving.startedAt) : current)
  const index = months.indexOf(shown)
  const inMonth = sessions.filter((s) => monthKey(s.startedAt) === shown)

  const go = (delta: number) => {
    const next = months[index + delta]
    if (next) setMonth(next)
  }

  const chooseView = (next: View) => {
    setView(next)
    try {
      localStorage.setItem(VIEW_KEY, next)
    } catch {
      // Remembering the view is a nicety; fine without it.
    }
  }

  const emptyMessage = sessions.length === 0 ? 'Your first meditation will bloom here.' : 'Still water this month.'

  return (
    <main className="page">
      <header className="topbar pond-topbar">
        <Link className="link-quiet" to="/" aria-label="Back to home">
          ‹ Home
        </Link>
        <button
          type="button"
          className="link-quiet link-button"
          aria-pressed={view === 'list'}
          onClick={() => chooseView(view === 'list' ? 'pond' : 'list')}
        >
          {view === 'list' ? 'Pond view' : 'List view'}
        </button>
      </header>

      <h1 className="pond-week">
        This week: {thisWeek} {thisWeek === 1 ? 'meditation' : 'meditations'}.
      </h1>

      <nav className="pond-months" aria-label="Month">
        <button
          type="button"
          className="pond-arrow"
          aria-label="Previous month"
          disabled={index <= 0}
          onClick={() => go(-1)}
        >
          ‹
        </button>
        <h2 className="pond-month" aria-live="polite">
          {formatMonth(shown)}
        </h2>
        <button
          type="button"
          className="pond-arrow"
          aria-label="Next month"
          disabled={index >= months.length - 1}
          onClick={() => go(1)}
        >
          ›
        </button>
      </nav>

      <div
        className="pond-swipe"
        key={shown}
        onPointerDown={(e) => {
          swipe.current = { x: e.clientX, y: e.clientY, moved: false }
        }}
        onPointerUp={(e) => {
          const start = swipe.current
          if (!start) return
          const dx = e.clientX - start.x
          const dy = e.clientY - start.y
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            start.moved = true
            go(dx < 0 ? 1 : -1) // swipe left for newer, right for older
          }
        }}
        onClickCapture={(e) => {
          // A swipe that ends on a lotus shouldn't also open it.
          if (swipe.current?.moved) e.preventDefault()
          swipe.current = null
        }}
      >
        {view === 'pond' ? (
          <PondView lotuses={layoutPond(inMonth)} arrivingId={arrivingId} emptyMessage={emptyMessage} />
        ) : inMonth.length === 0 ? (
          <p className="history-empty">{emptyMessage}</p>
        ) : (
          <ul className="history-list">
            {[...inMonth].reverse().map((s) => (
              <li key={s.id}>
                <Link className="history-row" to={`/history/${s.id}`}>
                  <span className="history-when">
                    {formatDay(s.startedAt)} · {formatTime(s.startedAt)}
                  </span>
                  <span className="history-feelings">{s.feelings.join(', ')}</span>
                  <span className="history-icons">
                    {hasText(s) && (
                      <span role="img" aria-label="Has written notes">
                        ✍️
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
