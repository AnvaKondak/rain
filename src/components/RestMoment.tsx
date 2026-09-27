import { useEffect, useState } from 'react'
import './RestMoment.css'

// How long the stillness lasts before Done appears.
const DONE_AFTER_MS = 400

interface RestMomentProps {
  saveFailed: boolean
  saving: boolean
  onRetrySave: () => void
  onDone: () => void
  onLearn: () => void
}

/**
 * After the rain: just the bloomed lotus on still water, then a quiet Done.
 * No auto-exit. Mounted only on this screen, so the timing starts fresh.
 */
export default function RestMoment({ saveFailed, saving, onRetrySave, onDone, onLearn }: RestMomentProps) {
  const [showDone, setShowDone] = useState(false)

  useEffect(() => {
    const done = window.setTimeout(() => setShowDone(true), DONE_AFTER_MS)
    return () => window.clearTimeout(done)
  }, [])

  return (
    <div className="rest">
      {saveFailed && (
        <p className="save-error" role="alert">
          This session couldn't be saved on this device.{' '}
          <button type="button" className="btn btn-quiet" onClick={onRetrySave} disabled={saving}>
            Try again
          </button>
        </p>
      )}

      <div className={`rest-actions${showDone ? ' is-shown' : ''}`}>
        <button type="button" className="btn btn-quiet rest-done" onClick={onDone}>
          Done
        </button>
        <a
          className="rest-learn"
          href="/learn"
          onClick={(e) => {
            e.preventDefault()
            onLearn()
          }}
        >
          Learn more about RAIN →
        </a>
      </div>
    </div>
  )
}
