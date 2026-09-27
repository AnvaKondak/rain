import type { StepId } from '../content/steps.ts'

export interface StepEntry {
  text?: string
}

export interface Session {
  id: string
  startedAt: string // ISO timestamp
  completedAt?: string // undefined if ended early and saved
  feelings: string[] // labels as selected at the time
  steps: Record<StepId, StepEntry>
}

export interface Feeling {
  id: string
  label: string
  isCustom: boolean
  order: number
}

export type AmbientSound = 'rain' | 'bowl' | 'wind'

export interface Settings {
  id: 'settings' // single row
  ambientEnabled: boolean
  ambientSound: AmbientSound
  ambientVolume: number // 0–1
}
