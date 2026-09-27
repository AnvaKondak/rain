import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { StepId } from '../content/steps.ts'
import type { StepEntry } from '../db/types.ts'
import { updateStep } from '../session/draft.ts'
import './ResponseOptions.css'

interface ResponseOptionsProps {
  step: StepId
  entry: StepEntry
}

export default function ResponseOptions({ step, entry }: ResponseOptionsProps) {
  const text = entry.text ?? ''
  const hasText = text.trim() !== ''
  const [writing, setWriting] = useState(hasText)
  const textRef = useRef<HTMLTextAreaElement>(null)

  // iPhone only shows the keyboard if focus happens during the tap itself,
  // so render the textarea right away and focus it before the tap ends.
  const toggleWriting = () => {
    const opening = !writing
    flushSync(() => setWriting(opening))
    const el = textRef.current
    if (!opening || !el) return
    el.focus()
    // Bring it into view once the keyboard has slid up, so it sits above it.
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' }), 350)
  }

  // "Just be" is the resting state. Choosing it folds the textarea away but
  // never deletes what was written; the Write chip shows a note is kept.
  const justBe = !writing && !hasText

  return (
    <div className="responses">
      <div className="response-chips" role="group" aria-label="How to respond">
        <button
          type="button"
          className="response-chip"
          aria-pressed={justBe}
          onClick={() => setWriting(false)}
        >
          🤍 Just be
        </button>
        <button
          type="button"
          className="response-chip"
          aria-pressed={writing}
          aria-expanded={writing}
          onClick={toggleWriting}
        >
          ✍️ {hasText && !writing ? 'Your note' : 'Write'}
        </button>
      </div>

      {writing && (
        <textarea
          ref={textRef}
          className="response-text"
          aria-label="Write what's here"
          placeholder="Whatever wants to be written…"
          value={text}
          rows={4}
          onChange={(e) => updateStep(step, { text: e.target.value })}
        />
      )}
    </div>
  )
}
