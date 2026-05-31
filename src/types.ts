// Core data model for Drop in the Bucket.
// Keep this flat and additive so the stats layer can grow without migrations.

export interface Goal {
  id: string
  emoji: string
  label: string
  /** Sort order on the home/goals pages (lower = higher up). */
  order: number
  createdAt: number
}

export interface Drop {
  id: string
  goalId: string
  /** Epoch milliseconds the drop was added. */
  ts: number
}

export const SCHEMA_VERSION = 1 as const

export interface PersistedState {
  version: number
  goals: Goal[]
  drops: Drop[]
}
