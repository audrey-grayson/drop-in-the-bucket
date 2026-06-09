// Week helpers. Weeks start on Sunday (the usual calendar-app convention) so
// the "this week" tally and the per-week stats summary agree on boundaries.

/** Midnight Sunday of the week containing `ts`, in local time. */
export function weekStart(ts: number): Date {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  // getDay(): 0=Sun..6=Sat — already Sunday-first, so subtract it directly.
  d.setDate(d.getDate() - d.getDay())
  return d
}

/** Stable key for a week, e.g. "2026-05-24" (the Sunday it starts on).
    Sorts chronologically as a string and is unique per week. */
export function weekKey(ts: number): string {
  const start = weekStart(ts)
  const y = start.getFullYear()
  const m = String(start.getMonth() + 1).padStart(2, '0')
  const day = String(start.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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

/** Short weekday labels Sun..Sat aligned to weekStart. */
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
