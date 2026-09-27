import Dexie, { type EntityTable } from 'dexie'
import { DEFAULT_FEELINGS } from '../content/feelings.ts'
import { uuid } from '../lib/uuid.ts'
import type { Feeling, Session, Settings } from './types.ts'

export const DEFAULT_SETTINGS: Settings = {
  id: 'settings',
  ambientEnabled: true,
  ambientSound: 'rain',
  ambientVolume: 0.5,
}

export function defaultFeelings(): Feeling[] {
  return DEFAULT_FEELINGS.map((label, order) => ({ id: uuid(), label, isCustom: false, order }))
}

export const db = new Dexie('rain') as Dexie & {
  sessions: EntityTable<Session, 'id'>
  feelings: EntityTable<Feeling, 'id'>
  settings: EntityTable<Settings, 'id'>
}

db.version(1).stores({
  sessions: 'id, startedAt',
  voiceNotes: 'id, sessionId',
  feelings: 'id, order',
  settings: 'id',
})

// Version 2 removes voice notes: the recordings table is deleted, and saved
// sessions forget the recordings they pointed to.
db.version(2)
  .stores({ voiceNotes: null })
  .upgrade((tx) =>
    tx
      .table('sessions')
      .toCollection()
      // Sessions as saved by version 1, which could point to a recording.
      .modify((session: { steps: Record<string, { voiceNoteId?: string }> }) => {
        for (const entry of Object.values(session.steps)) delete entry.voiceNoteId
      }),
  )

// Version 3 adds the lighter default feelings (calm, grateful, hopeful,
// joyful) to devices set up before they existed, after any already there.
const ADDED_IN_V3 = ['calm', 'grateful', 'hopeful', 'joyful']
db.version(3).upgrade(async (tx) => {
  const feelings = tx.table<Feeling>('feelings')
  const existing = await feelings.toArray()
  const have = new Set(existing.map((f) => f.label.trim().toLocaleLowerCase()))
  let order = Math.max(-1, ...existing.map((f) => f.order))
  const missing = ADDED_IN_V3.filter((label) => !have.has(label))
  await feelings.bulkAdd(missing.map((label) => ({ id: uuid(), label, isCustom: false, order: ++order })))
})

// Runs once, when the database is first created on this device.
db.on('populate', (tx) => {
  tx.table('feelings').bulkAdd(defaultFeelings())
  tx.table('settings').add(DEFAULT_SETTINGS)
})

/** Open (and on first launch, seed) the database, and ask the browser not to evict it. */
export async function initStorage() {
  await db.open()
  try {
    // navigator.storage is missing in insecure contexts (plain-http LAN dev).
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist()
    }
  } catch {
    // Persistence is best effort; the app works without it.
  }
}
