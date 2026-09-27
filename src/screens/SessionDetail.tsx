import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog.tsx'
import { STEPS } from '../content/steps.ts'
import { db } from '../db/db.ts'
import { deleteSession } from '../db/sessions.ts'
import { formatLongDay, formatTime } from '../lib/dates.ts'
import './SessionDetail.css'

export default function SessionDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  // null = looked and found nothing; undefined = still loading.
  const session = useLiveQuery(async () => (await db.sessions.get(id)) ?? null, [id])
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const back = (
    <header className="topbar">
      <Link className="link-quiet" to="/history">‹ Pond</Link>
    </header>
  )

  if (session === undefined) return null
  if (session === null) {
    return (
      <main className="page">
        {back}
        <p className="page-intro">This session isn't here anymore.</p>
      </main>
    )
  }

  return (
    <main className="page">
      {back}
      <h1 className="detail-title">{formatLongDay(session.startedAt)}</h1>
      <p className="page-intro">
        {formatTime(session.startedAt)}
        {!session.completedAt && ' · ended early'}
      </p>

      {session.feelings.length > 0 && (
        <ul className="detail-feelings" aria-label="Feelings">
          {session.feelings.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}

      {STEPS.map((step) => {
        const entry = session.steps[step.id]
        return (
          <section key={step.id} className="detail-step">
            <h2>{step.name}</h2>
            {entry.text && <p className="detail-text">{entry.text}</p>}
            {!entry.text && <p className="detail-empty">Just was.</p>}
          </section>
        )
      })}

      <button type="button" className="btn btn-quiet detail-delete" onClick={() => setConfirmingDelete(true)}>
        Delete session
      </button>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this session?"
        onClose={() => setConfirmingDelete(false)}
        actions={
          <>
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                await deleteSession(session.id)
                navigate('/history', { replace: true })
              }}
            >
              Delete
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setConfirmingDelete(false)}>
              Keep it
            </button>
          </>
        }
      >
        <p className="dialog-text">Its notes will be gone for good.</p>
      </ConfirmDialog>
    </main>
  )
}
