import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { setAmbientDrips, setAmbientIntensity, stopAmbient } from '../audio/ambient.ts'
import ConfirmDialog from '../components/ConfirmDialog.tsx'
import FeelingChips from '../components/FeelingChips.tsx'
import Lotus, { type LotusStage } from '../components/Lotus.tsx'
import RainStreaks from '../components/RainStreaks.tsx'
import RestMoment from '../components/RestMoment.tsx'
import ResponseOptions from '../components/ResponseOptions.tsx'
import StepDots from '../components/StepDots.tsx'
import StepMore from '../components/StepMore.tsx'
import { ARRIVE, STEPS } from '../content/steps.ts'
import { saveSession } from '../db/sessions.ts'
import type { Session } from '../db/types.ts'
import { clearDraft, useDraft } from '../session/draft.ts'
import './Practice.css'

const LEAVE_FADE_MS = 1600

// One screen for the whole flow (/practice/arrive … /practice/bloom),
// so the lotus stays mounted and opens smoothly from step to step.
export default function Practice() {
  const { step } = useParams()
  const navigate = useNavigate()
  const draft = useDraft()
  const [confirmingEnd, setConfirmingEnd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const [leaving, setLeaving] = useState(false)
  // Set when leaving the session on purpose. The draft is cleared once this
  // screen has actually gone, so the no-session redirect below can't race the
  // navigation and send us Home instead of where we're going.
  const exiting = useRef(false)
  useEffect(
    () => () => {
      if (exiting.current) clearDraft()
    },
    [],
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const isBloom = step === 'bloom'
  const isArrive = step === 'arrive'
  const index = STEPS.findIndex((s) => s.id === step)
  // What's on screen: settling in first, then the four steps.
  const current = isArrive ? ARRIVE : STEPS[index]
  const rain = isBloom || !current ? 0 : current.rain

  // The rain softens step by step; the last few drops arrive at Nurture.
  useEffect(() => {
    if (!current) return
    setAmbientIntensity(current.rain)
    setAmbientDrips(current === STEPS[STEPS.length - 1])
  }, [current])
  // No session in progress (e.g. a reload or a direct link): start from home.
  if (!draft || (!isBloom && !current)) return <Navigate to="/" replace />

  const stage: LotusStage = isBloom ? 'bloom' : isArrive ? 0 : ((index + 1) as LotusStage)
  const isLast = index === STEPS.length - 1
  const next = isArrive ? STEPS[0] : STEPS[index + 1]

  const save = async (session: Session) => {
    setSaving(true)
    try {
      await saveSession(session)
      setSaveFailed(false)
      return true
    } catch (err) {
      console.error('Could not save session', err)
      setSaveFailed(true)
      return false
    } finally {
      setSaving(false)
    }
  }
  const saveCompleted = () => save({ ...draft, completedAt: new Date().toISOString() })

  // The session is saved as it arrives at Bloom.
  const goNext = async () => {
    if (!isLast) return navigate(`/practice/${next.id}`)
    if (saving) return
    await saveCompleted()
    stopAmbient(4) // after the rain: fade to silence
    navigate('/practice/bloom')
  }
  const goBack = () => navigate(`/practice/${index > 0 ? STEPS[index - 1].id : 'arrive'}`)
  const exit = (to: string, state?: object) => {
    exiting.current = true
    stopAmbient()
    navigate(to, { replace: true, state })
  }
  const leave = () => exit('/')
  // Leaving the resting moment: a slow fade rather than a cut. The session
  // is already saved, so the new lotus is waiting on the pond either way.
  const leaveSlowly = (to: string, state: object) => {
    if (leaving) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return exit(to, state)
    setLeaving(true)
    window.setTimeout(() => exit(to, state), LEAVE_FADE_MS)
  }
  const toPond = () => leaveSlowly('/history', { arrived: draft.id })
  const toLearn = () => leaveSlowly('/learn', { back: '/history', arrived: draft.id })

  return (
    <main className={`practice${isBloom ? ' practice--bloom' : ''}${leaving ? ' is-leaving' : ''}`}>
      <div className="practice-top">
        {!isBloom && !isArrive && <StepDots current={index} total={STEPS.length} />}
      </div>

      <div className="practice-lotus">
        <RainStreaks intensity={rain} />
        <Lotus stage={stage} onWater />
      </div>

      {isBloom ? (
        <RestMoment saveFailed={saveFailed} saving={saving} onRetrySave={saveCompleted} onDone={toPond} onLearn={toLearn} />
      ) : (
        <div className="practice-body" key={current.name}>
          <h1 className={isArrive ? 'sr-only' : 'step-name'}>{current.name}</h1>
          <ul className="step-prompts">
            {current.prompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
          {!isArrive && <StepMore step={STEPS[index]} />}

          {step === 'recognize' && <FeelingChips selected={draft.feelings} />}
          {!isArrive && <ResponseOptions step={STEPS[index].id} entry={draft.steps[STEPS[index].id]} />}

          <div className="practice-actions">
            <p className="step-pause">Stay here as long as you like.</p>
            <button type="button" className="btn btn-primary" onClick={goNext}>
              {isArrive ? 'I’m ready to begin' : isLast ? 'Complete meditation' : 'I’m ready to move on'}
            </button>
            {next && <p className="step-next">Next: {next.name}</p>}
            <div className="practice-secondary">
              {!isArrive ? (
                <button type="button" className="btn btn-quiet" onClick={goBack}>
                  ‹ Back
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="btn btn-quiet"
                // Nothing to save yet while settling in, so just leave.
                onClick={() => (isArrive ? leave() : setConfirmingEnd(true))}
                aria-label="End session early"
              >
                ✕ End
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmingEnd}
        title="Save what you have?"
        onClose={() => setConfirmingEnd(false)}
        actions={
          <>
            <button
              type="button"
              className="btn btn-primary"
              disabled={saving}
              onClick={async () => {
                if (await save(draft)) leave()
              }}
            >
              Save
            </button>
            <button type="button" className="btn btn-quiet" onClick={leave}>
              Discard
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setConfirmingEnd(false)}>
              Keep going
            </button>
          </>
        }
      >
        {saveFailed && (
          <p className="save-error" role="alert">
            That didn't save. You can try again, or discard.
          </p>
        )}
      </ConfirmDialog>
    </main>
  )
}
