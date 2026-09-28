import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { isNative } from '../lib/native.ts'
import { DEFAULT_SETTINGS, db, defaultFeelings } from './db.ts'
import type { Feeling, Session, Settings, StepEntry } from './types.ts'

// Backups are a plain JSON file of everything the app keeps: sessions,
// feelings and settings. The user saves it wherever they like (on iPhone,
// through the share sheet), and can restore it later on any device.

const FORMAT = { app: 'rain', version: 1 } as const

export interface Backup {
  app: 'rain'
  version: 1
  exportedAt: string
  sessions: Session[]
  feelings: Feeling[]
  settings: Settings
}

/** A backup file that couldn't be read, with a message fit to show the user. */
export class BackupError extends Error {}

export async function createBackup(): Promise<Backup> {
  const [sessions, feelings, settings] = await Promise.all([
    db.sessions.orderBy('startedAt').toArray(),
    db.feelings.orderBy('order').toArray(),
    db.settings.get('settings'),
  ])
  return { ...FORMAT, exportedAt: new Date().toISOString(), sessions, feelings, settings: settings ?? DEFAULT_SETTINGS }
}

function fileName(date = new Date()) {
  const day = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((n) => String(n).padStart(2, '0')).join('-')
  return `rain-backup-${day}.json`
}

/**
 * Save a backup file. On iPhone this opens the share sheet (Save to Files,
 * iCloud Drive, AirDrop…); elsewhere it downloads the file.
 */
export async function exportBackup(): Promise<'saved' | 'cancelled'> {
  const backup = await createBackup()
  const json = JSON.stringify(backup, null, 2)

  // iPhone app: write the file, then hand it to the native share sheet.
  if (isNative) {
    const { uri } = await Filesystem.writeFile({
      path: fileName(),
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    })
    try {
      await Share.share({ title: 'After Rain backup', files: [uri] })
      return 'saved'
    } catch (err) {
      if (err instanceof Error && /cancel/i.test(err.message)) return 'cancelled'
      throw err
    }
  }

  const file = new File([json], fileName(), { type: 'application/json' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'After Rain backup' })
      return 'saved'
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
      // Sharing failed for another reason: fall back to a download.
    }
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'saved'
}

const isString = (v: unknown): v is string => typeof v === 'string'
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

function readEntry(v: unknown): StepEntry {
  return isObject(v) && isString(v.text) && v.text.trim() ? { text: v.text } : {}
}

function readSession(v: unknown): Session {
  if (!isObject(v) || !isString(v.id) || !isString(v.startedAt) || !isObject(v.steps)) {
    throw new BackupError('Some sessions in this file are damaged.')
  }
  const steps = v.steps
  return {
    id: v.id,
    startedAt: v.startedAt,
    completedAt: isString(v.completedAt) ? v.completedAt : undefined,
    feelings: Array.isArray(v.feelings) ? v.feelings.filter(isString) : [],
    steps: {
      recognize: readEntry(steps.recognize),
      allow: readEntry(steps.allow),
      investigate: readEntry(steps.investigate),
      nurture: readEntry(steps.nurture),
    },
  }
}

function readFeeling(v: unknown, index: number): Feeling {
  if (!isObject(v) || !isString(v.id) || !isString(v.label)) {
    throw new BackupError('The feelings in this file are damaged.')
  }
  return { id: v.id, label: v.label, isCustom: v.isCustom === true, order: typeof v.order === 'number' ? v.order : index }
}

function readSettings(v: unknown): Settings {
  if (!isObject(v)) return DEFAULT_SETTINGS
  const sound = v.ambientSound === 'bowl' || v.ambientSound === 'rain' ? v.ambientSound : 'wind'
  const volume = typeof v.ambientVolume === 'number' ? Math.min(1, Math.max(0, v.ambientVolume)) : 0.5
  return {
    id: 'settings',
    ambientEnabled: v.ambientEnabled !== false,
    ambientSound: sound,
    ambientVolume: volume,
  }
}

/** Read and check a backup file. Throws BackupError with a friendly message. */
export async function readBackup(file: File): Promise<Backup> {
  let data: unknown
  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new BackupError('This file isn’t a RAIN backup.')
  }
  if (!isObject(data) || data.app !== FORMAT.app || !Array.isArray(data.sessions)) {
    throw new BackupError('This file isn’t a RAIN backup.')
  }
  if (data.version !== FORMAT.version) {
    throw new BackupError('This backup was made by a different version of the app.')
  }
  const feelings = Array.isArray(data.feelings) ? data.feelings.map(readFeeling) : []
  return {
    ...FORMAT,
    exportedAt: isString(data.exportedAt) ? data.exportedAt : '',
    sessions: data.sessions.map(readSession),
    feelings: feelings.length > 0 ? feelings : defaultFeelings(),
    settings: readSettings(data.settings),
  }
}

/** Replace everything on this device with the backup, all at once. */
export async function restoreBackup(backup: Backup) {
  await db.transaction('rw', db.sessions, db.feelings, db.settings, async () => {
    await Promise.all([db.sessions.clear(), db.feelings.clear(), db.settings.clear()])
    await db.sessions.bulkPut(backup.sessions)
    await db.feelings.bulkPut(backup.feelings)
    await db.settings.put(backup.settings)
  })
}
