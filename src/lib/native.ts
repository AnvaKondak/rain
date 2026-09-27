import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

/** True inside the iPhone app (Capacitor), false in a web browser. */
export const isNative = Capacitor.isNativePlatform()

/**
 * In the iPhone app, links to other websites (target="_blank") open in
 * Safari's in-app viewer, so leaving the app is one swipe back.
 */
export function openExternalLinksInBrowser() {
  if (!isNative) return
  document.addEventListener(
    'click',
    (e) => {
      const link = (e.target as Element | null)?.closest?.('a[target="_blank"]')
      const href = link?.getAttribute('href')
      if (!href || !/^https?:\/\//.test(href)) return
      e.preventDefault()
      void Browser.open({ url: href })
    },
    { capture: true },
  )
}
