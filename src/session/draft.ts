import { useSyncExternalStore } from 'react'
import type { StepId } from '../content/steps.ts'
import type { Session, StepEntry } from '../db/types.ts'
import { uuid } from '../lib/uuid.ts'

// The session in progress lives only in memory until it's completed (or "Save what
// you have"), so nothing is written while someone is mid-practice.

let draft: Session | null = null
const listeners = new Set<() => void>()

function setDraft(next: Session | null) {
  draft = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useDraft(): Session | null {
  return useSyncExternalStore(subscribe, () => draft)
}

export function startDraft() {
  setDraft({
    id: uuid(),
    startedAt: new Date().toISOString(),
    feelings: [],
    steps: { recognize: {}, allow: {}, investigate: {}, nurture: {} },
  })
}

export function updateStep(step: StepId, entry: Partial<StepEntry>) {
  if (!draft) return
  setDraft({ ...draft, steps: { ...draft.steps, [step]: { ...draft.steps[step], ...entry } } })
}

export function clearDraft() {
  setDraft(null)
}

export function toggleFeeling(label: string) {
  if (!draft) return
  const feelings = draft.feelings.includes(label)
    ? draft.feelings.filter((f) => f !== label)
    : [...draft.feelings, label]
  setDraft({ ...draft, feelings })
}

// Keep a session in progress in step with edits made from Recognize.
// Saved sessions keep the label as it was when selected.
export function renameDraftFeeling(from: string, to: string) {
  if (!draft?.feelings.includes(from)) return
  setDraft({ ...draft, feelings: draft.feelings.map((f) => (f === from ? to : f)) })
}

export function removeDraftFeeling(label: string) {
  if (!draft?.feelings.includes(label)) return
  setDraft({ ...draft, feelings: draft.feelings.filter((f) => f !== label) })
}
