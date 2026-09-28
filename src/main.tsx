import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import '@fontsource-variable/fraunces/soft.css'
import '@fontsource-variable/lora'
import './index.css'
import App from './App.tsx'
import { initStorage } from './db/db.ts'
import { followDaypart } from './lib/daypart.ts'
import { isNative, openExternalLinksInBrowser } from './lib/native.ts'

followDaypart()
openExternalLinksInBrowser()

// Offline support on the web. The iPhone app already runs from bundled
// files, and iOS doesn't allow service workers there.
if (!isNative) {
  void import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }))
}

initStorage().catch((err) => console.error('Could not open storage', err))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
