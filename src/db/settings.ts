import { useLiveQuery } from 'dexie-react-hooks'
import { DEFAULT_SETTINGS, db } from './db.ts'
import type { Settings } from './types.ts'

/** Current settings; defaults until the database has answered. */
export function useSettings(): Settings {
  return useLiveQuery(() => db.settings.get('settings')) ?? DEFAULT_SETTINGS
}

export async function updateSettings(patch: Partial<Omit<Settings, 'id'>>) {
  await db.settings.update('settings', patch)
}
