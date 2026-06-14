import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { SCHEMA_VERSION, type Drop, type Goal, type PersistedState } from './types'
import { isSameWeek } from './lib/week'

const STORAGE_KEY = 'ditb.state'

const DEFAULT_GOALS: Goal[] = [
  { id: 'g-water', emoji: '💧', label: 'Drink water', order: 0, createdAt: Date.now() },
  { id: 'g-read', emoji: '📚', label: 'Read', order: 1, createdAt: Date.now() },
  { id: 'g-move', emoji: '🏃', label: 'Exercise', order: 2, createdAt: Date.now() },
]

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { version: SCHEMA_VERSION, goals: DEFAULT_GOALS, drops: [] }
    const parsed = JSON.parse(raw) as PersistedState
    // Future schema migrations branch on parsed.version here.
    return {
      version: SCHEMA_VERSION,
      goals: parsed.goals ?? [],
      drops: parsed.drops ?? [],
    }
  } catch {
    return { version: SCHEMA_VERSION, goals: DEFAULT_GOALS, drops: [] }
  }
}

interface Store {
  goals: Goal[]
  drops: Drop[]
  addGoal: (emoji: string, label: string) => void
  updateGoal: (id: string, patch: Partial<Pick<Goal, 'emoji' | 'label'>>) => void
  deleteGoal: (id: string) => void
  moveGoal: (id: string, dir: -1 | 1) => void
  /** Add a drop for a goal. Pass `ts` to backdate it to an earlier day. */
  addDrop: (goalId: string, ts?: number) => void
  /**
   * Remove the most recent drop for a goal (undo a misfire). Pass `withinTs` to
   * scope the undo to the week containing that timestamp, so undoing while
   * backdating removes a drop from the week you are looking at rather than the
   * globally-latest one.
   */
  undoDrop: (goalId: string, withinTs?: number) => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage full or blocked (private mode); nothing else we can do here.
    }
  }, [state])

  const addGoal = useCallback((emoji: string, label: string) => {
    setState((s) => ({
      ...s,
      goals: [
        ...s.goals,
        {
          id: uid(),
          emoji: emoji || '🎯',
          label: label.trim() || 'New goal',
          order: s.goals.length,
          createdAt: Date.now(),
        },
      ],
    }))
  }, [])

  const updateGoal = useCallback(
    (id: string, patch: Partial<Pick<Goal, 'emoji' | 'label'>>) => {
      setState((s) => ({
        ...s,
        goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      }))
    },
    [],
  )

  const deleteGoal = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      goals: s.goals
        .filter((g) => g.id !== id)
        .map((g, i) => ({ ...g, order: i })),
      drops: s.drops.filter((d) => d.goalId !== id),
    }))
  }, [])

  const moveGoal = useCallback((id: string, dir: -1 | 1) => {
    setState((s) => {
      const sorted = [...s.goals].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex((g) => g.id === id)
      const swap = idx + dir
      if (idx < 0 || swap < 0 || swap >= sorted.length) return s
      ;[sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]]
      return { ...s, goals: sorted.map((g, i) => ({ ...g, order: i })) }
    })
  }, [])

  const addDrop = useCallback((goalId: string, ts?: number) => {
    setState((s) => ({
      ...s,
      drops: [...s.drops, { id: uid(), goalId, ts: ts ?? Date.now() }],
    }))
  }, [])

  const undoDrop = useCallback((goalId: string, withinTs?: number) => {
    setState((s) => {
      let latestIdx = -1
      let latestTs = -Infinity
      s.drops.forEach((d, i) => {
        if (d.goalId !== goalId) return
        if (withinTs !== undefined && !isSameWeek(d.ts, withinTs)) return
        if (d.ts > latestTs) {
          latestTs = d.ts
          latestIdx = i
        }
      })
      if (latestIdx < 0) return s
      return { ...s, drops: s.drops.filter((_, i) => i !== latestIdx) }
    })
  }, [])

  const value = useMemo<Store>(
    () => ({
      goals: [...state.goals].sort((a, b) => a.order - b.order),
      drops: state.drops,
      addGoal,
      updateGoal,
      deleteGoal,
      moveGoal,
      addDrop,
      undoDrop,
    }),
    [state, addGoal, updateGoal, deleteGoal, moveGoal, addDrop, undoDrop],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
