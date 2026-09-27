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
import { STEPS } from '../content/steps.ts'
import { saveSession } from '../db/sessions.ts'
import type { Session } from '../db/types.ts'
import { clearDraft, useDraft } from '../session/draft.ts'
import './Practice.css'

const LEAVE_FADE_MS = 1600

// One screen for the whole flow (/practice/recognize … /practice/bloom),
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
  const index = STEPS.findIndex((s) => s.id === step)
  const rain = isBloom || index === -1 ? 0 : STEPS[index].rain

  // The rain softens step by step; the last few drops arrive at Nurture.
  useEffect(() => {
    if (isBloom || index === -1) return
    setAmbientIntensity(STEPS[index].rain)
    setAmbientDrips(STEPS[index].id === 'nurture')
  }, [index, isBloom])
  // No session in progress (e.g. a reload or a direct link): start from home.
  if (!draft || (!isBloom && index === -1)) return <Navigate to="/" replace />

  const stage = (isBloom ? 'bloom' : index + 1) as LotusStage
  const current = STEPS[index]
  const isLast = index === STEPS.length - 1

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
    if (!isLast) return navigate(`/practice/${STEPS[index + 1].id}`)
    if (saving) return
    await saveCompleted()
    stopAmbient(4) // after the rain: fade to silence
    navigate('/practice/bloom')
  }
  const goBack = () => navigate(`/practice/${STEPS[index - 1].id}`)
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
        {!isBloom && <StepDots current={index} total={STEPS.length} />}
      </div>

      <div className="practice-lotus">
        <RainStreaks intensity={rain} />
        <Lotus stage={stage} />
      </div>

      {isBloom ? (
        <RestMoment saveFailed={saveFailed} saving={saving} onRetrySave={saveCompleted} onDone={toPond} onLearn={toLearn} />
      ) : (
        <div className="practice-body" key={current.id}>
          <h1 className="step-name">{current.name}</h1>
          <p className="step-guidance">{current.guidance}</p>
          <StepMore step={current} />

          {current.id === 'recognize' && <FeelingChips selected={draft.feelings} />}
          <ResponseOptions step={current.id} entry={draft.steps[current.id]} />

          <div className="practice-actions">
            <button type="button" className="btn btn-primary" onClick={goNext}>
              {isLast ? 'Finish' : 'Next'}
            </button>
            <div className="practice-secondary">
              {index > 0 ? (
                <button type="button" className="btn btn-quiet" onClick={goBack}>
                  ‹ Back
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => setConfirmingEnd(true)}
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
