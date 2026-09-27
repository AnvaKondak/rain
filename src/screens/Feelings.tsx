import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import ConfirmDialog from '../components/ConfirmDialog.tsx'
import { db } from '../db/db.ts'
import {
  MAX_CUSTOM_FEELINGS,
  addCustomFeeling,
  isDuplicate,
  removeFeeling,
  renameFeeling,
  resetFeelings,
} from '../db/feelings.ts'
import type { Feeling } from '../db/types.ts'
import { removeDraftFeeling, renameDraftFeeling } from '../session/draft.ts'
import './Feelings.css'

export default function Feelings() {
  const navigate = useNavigate()
  const location = useLocation()
  const feelings = useLiveQuery(() => db.feelings.orderBy('order').toArray())
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [message, setMessage] = useState('')
  const [confirmingReset, setConfirmingReset] = useState(false)

  // Opened from Recognize or Settings: go back to wherever that was.
  const goBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/settings'))

  if (!feelings) return null

  const customCount = feelings.filter((f) => f.isCustom).length
  const canAdd = customCount < MAX_CUSTOM_FEELINGS

  const rename = async (feeling: Feeling, label: string) => {
    const trimmed = label.trim()
    if (!trimmed || trimmed === feeling.label) return false
    if (isDuplicate(feelings, trimmed, feeling.id)) {
      setMessage(`“${trimmed}” is already in your list.`)
      return false
    }
    setMessage('')
    await renameFeeling(feeling.id, trimmed)
    renameDraftFeeling(feeling.label, trimmed)
    return true
  }

  const remove = async (feeling: Feeling) => {
    setMessage('')
    await removeFeeling(feeling.id)
    removeDraftFeeling(feeling.label)
  }

  const add = async () => {
    const trimmed = newLabel.trim()
    if (!trimmed) return setAdding(false)
    if (isDuplicate(feelings, trimmed)) return setMessage(`“${trimmed}” is already in your list.`)
    setMessage('')
    await addCustomFeeling(trimmed)
    setNewLabel('')
    setAdding(false)
  }

  return (
    <main className="page">
      <header className="topbar">
        <button type="button" className="link-quiet link-button" onClick={goBack}>
          ‹ Back
        </button>
      </header>
      <h1>Feelings</h1>
      <p className="page-intro">Tap a name to change it. Past sessions keep the words you chose then.</p>

      <ul className="feeling-list">
        {feelings.map((f) => (
          <FeelingRow key={`${f.id}-${f.label}`} feeling={f} onRename={rename} onRemove={remove} />
        ))}
      </ul>

      {message && (
        <p className="feelings-message" role="status">
          {message}
        </p>
      )}

      {adding ? (
        <form
          className="feeling-add-form"
          onSubmit={(e) => {
            e.preventDefault()
            add()
          }}
        >
          <input
            className="feeling-input"
            aria-label="New feeling"
            placeholder="A feeling of your own"
            value={newLabel}
            maxLength={30}
            autoFocus
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-small">
            Add
          </button>
        </form>
      ) : (
        <button type="button" className="btn btn-outline" disabled={!canAdd} onClick={() => setAdding(true)}>
          + Add feeling
        </button>
      )}
      <p className="feelings-hint">
        {canAdd
          ? `You can add ${MAX_CUSTOM_FEELINGS - customCount} more of your own.`
          : `You have ${MAX_CUSTOM_FEELINGS} of your own. Remove one to add another.`}
      </p>

      <button type="button" className="btn btn-quiet feelings-reset" onClick={() => setConfirmingReset(true)}>
        Reset to defaults
      </button>

      <ConfirmDialog
        open={confirmingReset}
        title="Reset feelings?"
        onClose={() => setConfirmingReset(false)}
        actions={
          <>
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                for (const f of feelings) removeDraftFeeling(f.label)
                await resetFeelings()
                setMessage('')
                setConfirmingReset(false)
              }}
            >
              Reset
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setConfirmingReset(false)}>
              Cancel
            </button>
          </>
        }
      >
        <p className="dialog-text">This brings back the original feelings and removes your own. Past sessions stay as they are.</p>
      </ConfirmDialog>
    </main>
  )
}

interface FeelingRowProps {
  feeling: Feeling
  onRename: (feeling: Feeling, label: string) => Promise<boolean>
  onRemove: (feeling: Feeling) => void
}

function FeelingRow({ feeling, onRename, onRemove }: FeelingRowProps) {
  const [label, setLabel] = useState(feeling.label)

  const commit = async () => {
    if (!(await onRename(feeling, label))) setLabel(feeling.label)
  }

  return (
    <li className="feeling-row">
      <input
        className="feeling-input"
        aria-label={`Rename ${feeling.label}`}
        value={label}
        maxLength={30}
        enterKeyHint="done"
        onChange={(e) => setLabel(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
      />
      <span className="feeling-tag">{feeling.isCustom ? 'yours' : ''}</span>
      <button
        type="button"
        className="feeling-remove"
        aria-label={`Remove ${feeling.label}`}
        onClick={() => onRemove(feeling)}
      >
        ✕
      </button>
    </li>
  )
}
