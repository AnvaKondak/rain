import type { CapacitorConfig } from '@capacitor/cli'

// The native iPhone app: the built web app (dist/) runs from files bundled
// inside it. appId is permanent once the app is on the App Store.
const config: CapacitorConfig = {
  appId: 'com.anvakondak.rain',
  appName: 'After Rain',
  webDir: 'dist',
  backgroundColor: '#fbf6f1',
  ios: {
    // Let the page draw edge to edge; the app already pads for the notch
    // and home indicator with env(safe-area-inset-*).
    contentInset: 'never',
  },
}

export default config
