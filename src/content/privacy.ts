// The Privacy page. Keep it true: update it if the app ever starts sending
// anything anywhere (analytics, sync, accounts).

export const PRIVACY_UPDATED = 'September 27, 2026'

export const PRIVACY_INTRO =
  'Your practice is yours. This app doesn’t collect, send, or store any of your data anywhere but on your own device.'

export const PRIVACY_SECTIONS = [
  {
    heading: 'What stays on your device',
    text: 'Your sessions, feelings, notes, and settings are saved only on this device. They never leave it unless you export a backup. Nobody else, including the maker of this app, can see them.',
  },
  {
    heading: 'No accounts, no tracking',
    text: 'There are no accounts, no sign-in, no analytics, no ads, and no cookies used to follow you. The app works offline, with its fonts and sounds built in, so it doesn’t call out to other services while you use it.',
  },
  {
    heading: 'Backups',
    text: 'When you export a backup, the file goes wherever you choose, like Files or iCloud Drive. It contains your notes as plain text, so keep it somewhere private. Importing a backup replaces what’s on this device.',
  },
  {
    heading: 'Deleting your data',
    text: 'You can delete any session from the pond. Removing the app, or clearing its data, erases everything on this device for good. Because nothing is kept anywhere else, it can only be recovered from a backup you’ve exported.',
  },
  {
    heading: 'Links to other sites',
    text: 'Links on the Learn page open other websites, such as Tara Brach’s, which have their own privacy policies.',
  },
  {
    heading: 'Hosting',
    text: 'The app’s files are delivered by a web host, which may keep standard technical logs (like IP addresses) to run its service. None of your practice data is ever sent to it.',
  },
]
