/** Monday 00:00 local time of the week containing `date`. */
export function startOfWeek(date = new Date()): Date {
  const daysSinceMonday = (date.getDay() + 6) % 7
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysSinceMonday)
}

/** Whether an ISO timestamp falls in this Monday–Sunday week, local time. */
export function isThisWeek(iso: string, now = new Date()): boolean {
  const start = startOfWeek(now)
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7)
  const t = new Date(iso)
  return t >= start && t < end
}

const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
const longDayFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

export const formatDay = (iso: string) => dayFormat.format(new Date(iso))
export const formatLongDay = (iso: string) => longDayFormat.format(new Date(iso))
export const formatTime = (iso: string) => timeFormat.format(new Date(iso))
