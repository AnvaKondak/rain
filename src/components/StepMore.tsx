import { useId, useState } from 'react'
import { RAIN_SOURCE_URL, type StepContent } from '../content/steps.ts'
import './StepMore.css'

/** Going deeper on a step: Tara Brach's words, folded away until asked for. */
export default function StepMore({ step }: { step: StepContent }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="step-more">
      <button
        type="button"
        className="step-more-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? 'Less' : 'More'} <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="step-more-panel" id={panelId}>
          <figure className="step-quote">
            <blockquote cite={RAIN_SOURCE_URL}>“{step.quote}”</blockquote>
            <figcaption>— Tara Brach</figcaption>
          </figure>
          <a className="step-source" href={RAIN_SOURCE_URL} target="_blank" rel="noopener noreferrer">
            Read her full description ›<span className="sr-only"> (opens in your browser)</span>
          </a>
        </div>
      )}
    </div>
  )
}
