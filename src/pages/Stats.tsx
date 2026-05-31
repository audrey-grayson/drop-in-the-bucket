import { useMemo } from 'react'
import { useStore } from '../store'
import { WEEKDAYS, weekKey, weekLabel, weekStart } from '../lib/week'
import BarChart, { type Bar } from '../components/BarChart'

// Deterministic colour per goal id so charts stay stable across renders.
function colorFor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360
  return `hsl(${h} 70% 55%)`
}

interface WeekBucket {
  key: string
  startTs: number
  total: number
  perGoal: Record<string, number>
}

export default function Stats() {
  const { goals, drops } = useStore()
  const goalById = useMemo(
    () => Object.fromEntries(goals.map((g) => [g.id, g])),
    [goals],
  )

  const weeks = useMemo<WeekBucket[]>(() => {
    const map = new Map<string, WeekBucket>()
    for (const d of drops) {
      const key = weekKey(d.ts)
      let wb = map.get(key)
      if (!wb) {
        wb = {
          key,
          startTs: weekStart(d.ts).getTime(),
          total: 0,
          perGoal: {},
        }
        map.set(key, wb)
      }
      wb.total++
      wb.perGoal[d.goalId] = (wb.perGoal[d.goalId] ?? 0) + 1
    }
    return [...map.values()].sort((a, b) => b.startTs - a.startTs)
  }, [drops])

  const totalDrops = drops.length

  // This-week bars: drops per weekday across all goals.
  const thisWeekStart = weekStart(Date.now()).getTime()
  const weekdayBars = useMemo<Bar[]>(() => {
    const counts = new Array(7).fill(0)
    for (const d of drops) {
      if (weekStart(d.ts).getTime() === thisWeekStart) {
        const day = (new Date(d.ts).getDay() + 6) % 7
        counts[day]++
      }
    }
    return WEEKDAYS.map((label, i) => ({
      label,
      value: counts[i],
      color: 'var(--accent)',
    }))
  }, [drops, thisWeekStart])

  // All-time per-goal totals.
  const goalBars = useMemo<Bar[]>(
    () =>
      goals.map((g) => ({
        label: g.emoji,
        value: drops.filter((d) => d.goalId === g.id).length,
        color: colorFor(g.id),
      })),
    [goals, drops],
  )

  if (totalDrops === 0) {
    return (
      <div className="empty-state">
        <p className="empty-emoji">📊</p>
        <p>No drops recorded yet.</p>
        <p className="muted">Tap a bucket on the home page to start filling it.</p>
      </div>
    )
  }

  return (
    <div className="stats-page">
      <div className="stat-cards">
        <div className="stat-card card">
          <span className="stat-num">{totalDrops}</span>
          <span className="stat-cap">total drops</span>
        </div>
        <div className="stat-card card">
          <span className="stat-num">{weeks.length}</span>
          <span className="stat-cap">active weeks</span>
        </div>
        <div className="stat-card card">
          <span className="stat-num">{weeks[0]?.total ?? 0}</span>
          <span className="stat-cap">this week</span>
        </div>
      </div>

      <section className="card chart-card">
        <h2>This week by day</h2>
        <BarChart bars={weekdayBars} />
      </section>

      <section className="card chart-card">
        <h2>All-time by goal</h2>
        <BarChart bars={goalBars} />
      </section>

      <section className="week-summary">
        <h2>Weekly history</h2>
        <div className="week-scroll">
          {weeks.map((w) => (
            <article className="week-card card" key={w.key}>
              <header className="week-card-head">
                <span className="week-name">Week of {weekLabel(w.startTs)}</span>
                <span className="week-total">{w.total}</span>
              </header>
              <ul className="week-breakdown">
                {Object.entries(w.perGoal)
                  .sort((a, b) => b[1] - a[1])
                  .map(([goalId, n]) => (
                    <li key={goalId}>
                      <span className="wb-emoji">
                        {goalById[goalId]?.emoji ?? '❓'}
                      </span>
                      <span className="wb-label">
                        {goalById[goalId]?.label ?? 'Deleted goal'}
                      </span>
                      <span className="wb-count">{n}</span>
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
