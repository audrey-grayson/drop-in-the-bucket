import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { isSameWeek } from '../lib/week'
import Bucket from '../components/Bucket'
import Droplet, { type FallingDrop } from '../components/Droplet'
import TallyMarks from '../components/TallyMarks'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export default function Home() {
  const { goals, drops, addDrop, undoDrop } = useStore()
  const [falling, setFalling] = useState<FallingDrop[]>([])
  const [splashing, setSplashing] = useState<Record<string, boolean>>({})
  // Each in-flight droplet remembers which goal it will credit on landing.
  const pending = useRef<Record<string, string>>({})

  const now = Date.now()
  const weekCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of drops) {
      if (isSameWeek(d.ts, now)) counts[d.goalId] = (counts[d.goalId] ?? 0) + 1
    }
    return counts
  }, [drops, now])

  const launch = useCallback(
    (goalId: string, bucketEl: HTMLButtonElement | null) => {
      if (!bucketEl) return
      const rect = bucketEl.getBoundingClientRect()
      const id = uid()
      pending.current[id] = goalId
      setFalling((f) => [
        ...f,
        {
          id,
          x: rect.left + rect.width / 2,
          // Aim for just below the rim so it visibly enters the bucket.
          targetY: rect.top + rect.height * 0.32,
        },
      ])
    },
    [],
  )

  const onLand = useCallback(
    (id: string) => {
      const goalId = pending.current[id]
      delete pending.current[id]
      setFalling((f) => f.filter((d) => d.id !== id))
      if (!goalId) return
      addDrop(goalId)
      setSplashing((s) => ({ ...s, [goalId]: true }))
      setTimeout(
        () => setSplashing((s) => ({ ...s, [goalId]: false })),
        450,
      )
    },
    [addDrop],
  )

  if (goals.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-emoji">🪣</p>
        <p>No goals yet.</p>
        <Link className="btn primary" to="/goals">
          Add your first goal
        </Link>
      </div>
    )
  }

  return (
    <div className="home">
      <div className="droplet-layer">
        {falling.map((d) => (
          <Droplet key={d.id} drop={d} onLand={onLand} />
        ))}
      </div>

      {goals.map((goal) => {
        const count = weekCounts[goal.id] ?? 0
        return (
          <BucketRow
            key={goal.id}
            emoji={goal.emoji}
            label={goal.label}
            count={count}
            splashing={!!splashing[goal.id]}
            onDrop={(el) => launch(goal.id, el)}
            onUndo={() => undoDrop(goal.id)}
          />
        )
      })}
    </div>
  )
}

function BucketRow({
  emoji,
  label,
  count,
  splashing,
  onDrop,
  onUndo,
}: {
  emoji: string
  label: string
  count: number
  splashing: boolean
  onDrop: (el: HTMLButtonElement | null) => void
  onUndo: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  // Fill cycles every 10 drops so the bucket keeps reacting past a full week.
  const fill = (count % 10) / 10 + (count > 0 ? 0.08 : 0)

  return (
    <section className="goal-row">
      <div className="goal-head">
        <span className="goal-emoji" aria-hidden="true">
          {emoji}
        </span>
        <span className="goal-label">{label}</span>
        {count > 0 && (
          <button className="undo-btn" onClick={onUndo} aria-label="Undo last drop">
            ↩
          </button>
        )}
      </div>
      <div className="goal-bucket">
        <Bucket
          ref={ref}
          fill={fill}
          splashing={splashing}
          onActivate={() => onDrop(ref.current)}
        />
        <div className="goal-tally">
          <TallyMarks count={count} />
        </div>
      </div>
    </section>
  )
}
