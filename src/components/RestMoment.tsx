import { useEffect, useState } from 'react'
import './RestMoment.css'

const CLOSING = [
  'Take a moment to notice how you feel now. It might have shifted, or it might not have. Either is okay.',
  'Notice that you were able to meet this with care. That part of you is always there.',
]

// How long the stillness lasts before the way to the pond appears.
const DONE_AFTER_MS = 400

interface RestMomentProps {
  saveFailed: boolean
  saving: boolean
  onRetrySave: () => void
  onDone: () => void
  onLearn: () => void
}

/**
 * After the rain: the bloomed lotus on still water, a few closing words, then a
 * way to the pond.
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

      <div className="rest-closing">
        {CLOSING.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <div className={`rest-actions${showDone ? ' is-shown' : ''}`}>
        <button type="button" className="btn btn-primary rest-done" onClick={onDone}>
          See your lotus in the pond
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
