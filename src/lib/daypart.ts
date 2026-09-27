import { timeOfDay } from './pond.ts'

/** Tint the sky for the time of day: sets data-daypart on <html>. */
export function applyDaypart() {
  document.documentElement.dataset.daypart = timeOfDay(new Date().toISOString())
}

/** Apply now (before first paint) and keep it current while the app is open. */
export function followDaypart() {
  applyDaypart()
  window.setInterval(applyDaypart, 5 * 60 * 1000)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') applyDaypart()
  })
}
