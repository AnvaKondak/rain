import { uuid } from '../lib/uuid.ts'
import { db, defaultFeelings } from './db.ts'
import type { Feeling } from './types.ts'

export const MAX_CUSTOM_FEELINGS = 3

const same = (a: string, b: string) => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase()

/** Whether `label` is already in the list (ignoring case), other than `exceptId`. */
export function isDuplicate(feelings: Feeling[], label: string, exceptId?: string) {
  return feelings.some((f) => f.id !== exceptId && same(f.label, label))
}

export async function addCustomFeeling(label: string) {
  await db.transaction('rw', db.feelings, async () => {
    const all = await db.feelings.toArray()
    if (all.filter((f) => f.isCustom).length >= MAX_CUSTOM_FEELINGS) return
    const order = Math.max(-1, ...all.map((f) => f.order)) + 1
    await db.feelings.add({ id: uuid(), label: label.trim(), isCustom: true, order })
  })
}

export async function renameFeeling(id: string, label: string) {
  await db.feelings.update(id, { label: label.trim() })
}

export async function removeFeeling(id: string) {
  await db.feelings.delete(id)
}

export async function resetFeelings() {
  await db.transaction('rw', db.feelings, async () => {
    await db.feelings.clear()
    await db.feelings.bulkAdd(defaultFeelings())
  })
}
