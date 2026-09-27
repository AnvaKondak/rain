import type { AmbientSound } from '../db/types.ts'
import { isNative } from '../lib/native.ts'
import { setAudioSessionType } from './session.ts'

// Ambient loops through Web Audio: iOS ignores <audio>.volume, so fades and
// volume go through a GainNode instead.
//
// Softening rain: each step lowers an "intensity" (1 → 0.25). The main loop's
// volume is the user's volume × intensity, and for rain a low-pass filter
// closes too (8000 Hz → 1500 Hz) so the rain sounds farther away, not just
// quieter. At Nurture a light drips loop fades in for the last few drops.

const FADE_IN_SEC = 2
const FADE_OUT_SEC = 3
const SOFTEN_SEC = 3
const DRIPS_LEVEL = 0.6 // relative to the user's volume

type Loop = AmbientSound | 'drips'
interface Layer {
  source: AudioBufferSourceNode
  gain: GainNode
  filter?: BiquadFilterNode
}

let ctx: AudioContext | null = null
const buffers = new Map<Loop, Promise<AudioBuffer>>()
let main: Layer | null = null
let drips: Layer | null = null
let sound: AmbientSound | null = null
let userVolume = 0.5
let intensity = 1
let dripsWanted = false
// Bumped on every start/stop so a slow load can't start a sound that was
// already stopped or replaced.
let generation = 0

// The slider is linear; ears are not. Squaring gives a gentler low end.
const toGain = (volume: number) => Math.min(1, Math.max(0, volume)) ** 2
const mainGain = () => toGain(userVolume * intensity)
const dripsGain = () => toGain(userVolume) * DRIPS_LEVEL

/** Low-pass cutoff for an intensity: 1 → 8000 Hz, 0.25 → 1500 Hz, even steps to the ear. */
function cutoff(level: number) {
  const t = Math.min(1, Math.max(0, (level - 0.25) / 0.75))
  return 1500 * (8000 / 1500) ** t
}

/** Create or wake the audio context. Must run inside a tap (iOS rule). */
function context(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    // Let the sound play with the iPhone's silent switch on.
    setAudioSessionType('playback')
  }
  if (ctx.state !== 'running') void ctx.resume()
  return ctx
}

// The iPhone app's console can't print error objects, so spell them out.
const describeError = (err: unknown) => (err instanceof Error ? `${err.name}: ${err.message}` : String(err))

function load(ac: AudioContext, loop: Loop): Promise<AudioBuffer> {
  let buffer = buffers.get(loop)
  if (!buffer) {
    buffer = fetch(`/sounds/${loop}.mp3`)
      // In the iPhone app, bundled files can answer with status 0 even when
      // the data is there, so judge by the data rather than the status.
      .then(async (res) => {
        if (!res.ok && res.status !== 0) throw new Error(`${loop}.mp3: HTTP ${res.status}`)
        const data = await res.arrayBuffer()
        if (data.byteLength === 0) throw new Error(`${loop}.mp3: empty response (HTTP ${res.status})`)
        return data
      })
      .then((data) =>
        ac.decodeAudioData(data).catch((err) => {
          throw new Error(`${loop}.mp3 (${data.byteLength} bytes) couldn't be decoded: ${describeError(err)}`)
        }),
      )
    buffer.catch(() => buffers.delete(loop)) // allow a retry later
    buffers.set(loop, buffer)
  }
  return buffer
}

// On iPhone, Web Audio is muted by the Silent switch. Playing an (inaudible)
// <audio> element alongside it moves the page into iOS's "playback" audio
// session, so the ambient sound is heard like music is.
const onIOS = isNative || /iPhone|iPad|iPod/.test(navigator.userAgent)
let keepAlive: HTMLAudioElement | null = null

/** A tiny silent WAV, made on the fly so there's no extra file to ship. */
function silentWav(): string {
  const rate = 8000
  const samples = rate / 2 // half a second, looped
  const buf = new ArrayBuffer(44 + samples)
  const v = new DataView(buf)
  const text = (at: number, s: string) => [...s].forEach((c, i) => v.setUint8(at + i, c.charCodeAt(0)))
  text(0, 'RIFF')
  v.setUint32(4, 36 + samples, true)
  text(8, 'WAVEfmt ')
  v.setUint32(16, 16, true) // PCM header size
  v.setUint16(20, 1, true) // PCM
  v.setUint16(22, 1, true) // mono
  v.setUint32(24, rate, true)
  v.setUint32(28, rate, true) // bytes per second
  v.setUint16(32, 1, true) // block align
  v.setUint16(34, 8, true) // 8-bit
  text(36, 'data')
  v.setUint32(40, samples, true)
  for (let i = 0; i < samples; i++) v.setUint8(44 + i, 128) // 8-bit silence
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
}

/** Must run inside a tap, like the AudioContext. */
function startKeepAlive() {
  if (!onIOS) return
  if (!keepAlive) {
    keepAlive = new Audio(silentWav())
    keepAlive.loop = true
    keepAlive.setAttribute('playsinline', '')
  }
  keepAlive.play().catch(() => {
    // Not allowed outside a tap; the next tap will try again.
  })
}

function stopKeepAlive(afterSeconds: number) {
  const mine = generation
  window.setTimeout(() => {
    if (mine === generation) keepAlive?.pause()
  }, afterSeconds * 1000 + 200)
}

/**
 * Loop only the audible part: MP3 encoders pad each end with a few dozen
 * milliseconds of near-silence, heard as a dip on every loop. Trim what is
 * quiet relative to the file's peak, but never more than encoder padding
 * could be, so intentional quiet at either end is kept.
 */
function audibleRange(buffer: AudioBuffer): [number, number] {
  const maxTrim = Math.round(buffer.sampleRate * 0.06)
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c))
  const peak = Math.max(...channels.map((d) => d.reduce((m, v) => Math.max(m, Math.abs(v)), 0)))
  if (peak === 0) return [0, buffer.duration]
  const threshold = peak * 0.03
  const loud = (i: number) => channels.some((d) => Math.abs(d[i]) >= threshold)

  let first = 0
  while (first < maxTrim && !loud(first)) first++
  let last = buffer.length - 1
  while (last > buffer.length - 1 - maxTrim && !loud(last)) last--
  return [first / buffer.sampleRate, (last + 1) / buffer.sampleRate]
}

function rampTo(param: AudioParam, value: number, seconds: number, ac: AudioContext) {
  const now = ac.currentTime
  if (typeof param.cancelAndHoldAtTime === 'function') {
    param.cancelAndHoldAtTime(now)
  } else {
    const current = param.value
    param.cancelScheduledValues(now)
    param.setValueAtTime(current, now)
  }
  param.linearRampToValueAtTime(value, now + seconds)
}

/** Start a looping layer from silence, fading in to `gain` over `fadeSec`. */
function startLayer(ac: AudioContext, buffer: AudioBuffer, gain: number, fadeSec: number, filterHz?: number): Layer {
  const [loopStart, loopEnd] = audibleRange(buffer)
  const source = ac.createBufferSource()
  source.buffer = buffer
  source.loop = true
  source.loopStart = loopStart
  source.loopEnd = loopEnd

  const gainNode = ac.createGain()
  gainNode.gain.setValueAtTime(0, ac.currentTime)
  gainNode.gain.linearRampToValueAtTime(gain, ac.currentTime + fadeSec)

  let filter: BiquadFilterNode | undefined
  if (filterHz !== undefined) {
    filter = ac.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(filterHz, ac.currentTime)
    source.connect(filter).connect(gainNode)
  } else {
    source.connect(gainNode)
  }
  gainNode.connect(ac.destination)
  source.start(ac.currentTime, loopStart)
  return { source, gain: gainNode, filter }
}

function fadeOutLayer(layer: Layer | null, seconds: number) {
  if (!layer || !ctx) return
  const { source, gain, filter } = layer
  rampTo(gain.gain, 0, seconds, ctx)
  source.onended = () => {
    source.disconnect()
    filter?.disconnect()
    gain.disconnect()
  }
  source.stop(ctx.currentTime + seconds + 0.05)
}

function fadeOutAll(seconds: number) {
  fadeOutLayer(main, seconds)
  fadeOutLayer(drips, seconds)
  main = null
  drips = null
}

/** Start a sound at full intensity, fading in over ~2s. Call directly from a tap handler. */
export function startAmbient(next: AmbientSound, volume: number) {
  const ac = context()
  startKeepAlive()
  const mine = ++generation
  fadeOutAll(0.4)
  sound = next
  userVolume = volume
  intensity = 1
  dripsWanted = false
  load(ac, next)
    .then((buffer) => {
      if (mine !== generation) return
      main = startLayer(ac, buffer, mainGain(), FADE_IN_SEC, next === 'rain' ? cutoff(intensity) : undefined)
    })
    .catch((err) => console.warn('Ambient sound unavailable:', describeError(err)))
}

/** Fade out (~3s by default) and stop. Safe to call when nothing is playing. */
export function stopAmbient(fadeSeconds = FADE_OUT_SEC) {
  generation++
  sound = null
  dripsWanted = false
  fadeOutAll(fadeSeconds)
  stopKeepAlive(fadeSeconds)
}

/** Change the user's volume for whatever is playing. */
export function setAmbientVolume(volume: number) {
  userVolume = volume
  if (!ctx) return
  if (main) rampTo(main.gain.gain, mainGain(), 0.15, ctx)
  if (drips) rampTo(drips.gain.gain, dripsGain(), 0.15, ctx)
}

/** Soften (or strengthen) the sound to a step's intensity, 0–1, over ~3s. */
export function setAmbientIntensity(level: number) {
  intensity = level
  if (!main || !ctx) return
  rampTo(main.gain.gain, mainGain(), SOFTEN_SEC, ctx)
  if (main.filter) rampTo(main.filter.frequency, cutoff(level), SOFTEN_SEC, ctx)
}

/** Fade the "last few drops" layer in or out (rain only). */
export function setAmbientDrips(on: boolean) {
  dripsWanted = on
  if (!ctx) return
  if (!on) {
    fadeOutLayer(drips, SOFTEN_SEC)
    drips = null
    return
  }
  if (drips || sound !== 'rain') return
  const ac = ctx
  const mine = generation
  load(ac, 'drips')
    .then((buffer) => {
      if (mine !== generation || !dripsWanted || drips) return
      drips = startLayer(ac, buffer, dripsGain(), SOFTEN_SEC)
    })
    .catch((err) => console.warn('Drips sound unavailable:', describeError(err)))
}
