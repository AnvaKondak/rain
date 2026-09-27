import type { Session, StepEntry } from './types.ts'
import { db } from './db.ts'

// Drop blank notes so an untouched step is stored as {} ("Just was").
function cleanEntry({ text }: StepEntry): StepEntry {
  const trimmed = text?.trim()
  return trimmed ? { text: trimmed } : {}
}

export async function saveSession(session: Session) {
  await db.sessions.put({
    ...session,
    steps: {
      recognize: cleanEntry(session.steps.recognize),
      allow: cleanEntry(session.steps.allow),
      investigate: cleanEntry(session.steps.investigate),
      nurture: cleanEntry(session.steps.nurture),
    },
  })
}

export async function deleteSession(id: string) {
  await db.sessions.delete(id)
}
