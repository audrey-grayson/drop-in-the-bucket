// Week helpers. We use ISO weeks (Monday start) so the "this week" tally and
// the per-week stats summary agree on boundaries.

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Midnight Monday of the week containing `ts`, in local time. */
export function weekStart(ts: number): Date {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  // getDay(): 0=Sun..6=Sat. Shift so Monday is the first day.
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d
}

/** Stable key for a week, e.g. "2026-W22". Sorts chronologically as a string. */
export function weekKey(ts: number): string {
  const start = weekStart(ts)
  // ISO week number per the standard Thursday rule.
  const thursday = new Date(start)
  thursday.setDate(start.getDate() + 3)
  const year = thursday.getFullYear()
  const firstThursday = new Date(year, 0, 1)
  const firstDay = (firstThursday.getDay() + 6) % 7
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3)
  const week =
    1 + Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * MS_PER_DAY))
  return `${year}-W${String(week).padStart(2, '0')}`
}

/** Human label for a week start, e.g. "May 25". */
export function weekLabel(ts: number): string {
  return weekStart(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function isSameWeek(a: number, b: number): boolean {
  return weekStart(a).getTime() === weekStart(b).getTime()
}

/** Short weekday labels Mon..Sun aligned to weekStart. */
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
