type AudioSessionType = 'auto' | 'playback'

/**
 * Safari's Audio Session API (iOS 16.4+): 'playback' keeps ambient sound
 * playing with the silent switch on. Other browsers don't have it, and
 * that's fine.
 */
export function setAudioSessionType(type: AudioSessionType) {
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
  if (!session) return
  try {
    session.type = type
  } catch {
    // Unsupported value on this version; keep the default.
  }
}
