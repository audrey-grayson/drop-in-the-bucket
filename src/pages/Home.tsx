import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { isSameWeek, weekStart } from '../lib/week'
import Bucket from '../components/Bucket'
import Droplet, { type FallingDrop } from '../components/Droplet'
import TallyMarks from '../components/TallyMarks'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

/** Midnight (local) for the day containing `ts`. */
function dayStart(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export default function Home() {
  const { goals, drops, addDrop, undoDrop } = useStore()
  const [falling, setFalling] = useState<FallingDrop[]>([])
  const [splashing, setSplashing] = useState<Record<string, boolean>>({})
  // Each in-flight droplet remembers which goal it will credit on landing.
  const pending = useRef<Record<string, string>>({})

  const now = Date.now()
  const today = dayStart(now)
  // The day new drops are credited to. Defaults to today; the day selector lets
  // the user backdate to an earlier day this week if they forgot to log it.
  const [selectedDay, setSelectedDay] = useState(today)

  // The days of the current week, from Sunday up to (and including) today.
  const days = useMemo(() => {
    const start = weekStart(now).getTime()
    const out: number[] = []
    for (let t = start; t <= today; t += 24 * 60 * 60 * 1000) out.push(t)
    return out
  }, [now, today])

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
      // For today, log the exact moment. For a backdated day, keep the current
      // time-of-day but on the selected date so drops stay ordered.
      const ts =
        selectedDay === today ? Date.now() : selectedDay + (Date.now() - today)
      addDrop(goalId, ts)
      setSplashing((s) => ({ ...s, [goalId]: true }))
      setTimeout(
        () => setSplashing((s) => ({ ...s, [goalId]: false })),
        450,
      )
    },
    [addDrop, selectedDay, today],
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

      <DaySelector
        days={days}
        selected={selectedDay}
        today={today}
        onSelect={setSelectedDay}
      />

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

function DaySelector({
  days,
  selected,
  today,
  onSelect,
}: {
  days: number[]
  selected: number
  today: number
  onSelect: (ts: number) => void
}) {
  // Nothing to choose from on the first day of the week.
  if (days.length < 2) return null
  const backdating = selected !== today
  return (
    <div className="day-selector">
      <div className="day-strip" role="group" aria-label="Choose a day to log">
        {days.map((ts) => {
          const d = new Date(ts)
          const isToday = ts === today
          return (
            <button
              key={ts}
              className={`day-chip${ts === selected ? ' selected' : ''}`}
              aria-pressed={ts === selected}
              onClick={() => onSelect(ts)}
            >
              <span className="day-dow">
                {isToday
                  ? 'Today'
                  : d.toLocaleDateString(undefined, { weekday: 'short' })}
              </span>
              <span className="day-num">{d.getDate()}</span>
            </button>
          )
        })}
      </div>
      {backdating && (
        <p className="day-hint">
          Backdating to{' '}
          {new Date(selected).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      )}
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
      <span className="goal-emoji" aria-hidden="true">
        {emoji}
      </span>
      <span className="goal-label">{label}</span>
      <div className="goal-right">
        {count > 0 && (
          <button className="undo-btn" onClick={onUndo} aria-label="Undo last drop">
            ↩
          </button>
        )}
        <div className="goal-tally">
          <TallyMarks count={count} />
        </div>
        <Bucket
          ref={ref}
          fill={fill}
          splashing={splashing}
          onActivate={() => onDrop(ref.current)}
        />
      </div>
    </section>
  )
}
