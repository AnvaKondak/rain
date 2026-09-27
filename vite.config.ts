import react from '@vitejs/plugin-react'
import darkTheme from 'postcss-dark-theme-class'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Installable (Add to Home Screen) and fully offline: the service worker
    // precaches the whole app, including the font and the ambient sounds.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // registered in main.tsx, on the web only
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'After Rain',
        short_name: 'After Rain',
        description: 'A quiet place to practice RAIN: Recognize, Allow, Investigate, Nurture.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fbf6f1',
        theme_color: '#fbf6f1',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,svg,png,woff2,mp3}'],
        // Any screen opened offline (e.g. /history) loads the app shell.
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  css: {
    postcss: {
      // Dark styles are written as @media (prefers-color-scheme: dark). This
      // also applies them under <html data-theme="dark"> and skips them under
      // data-theme="light", so the day/night switch can override the system.
      plugins: [darkTheme({ darkSelector: '[data-theme="dark"]', lightSelector: '[data-theme="light"]' })],
    },
  },
})
