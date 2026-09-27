import { useEffect, useState } from 'react'
import { setAmbientVolume, startAmbient, stopAmbient } from '../audio/ambient.ts'
import { updateSettings, useSettings } from '../db/settings.ts'
import type { AmbientSound } from '../db/types.ts'
import './AmbientSettings.css'

const SOUNDS: { id: AmbientSound; label: string }[] = [
  { id: 'rain', label: 'Rain' },
  { id: 'bowl', label: 'Singing bowl' },
  { id: 'wind', label: 'Wind' },
]

export default function AmbientSettings() {
  const settings = useSettings()
  const [listening, setListening] = useState(false)

  // Leaving Settings ends any preview.
  useEffect(() => () => stopAmbient(0.8), [])

  const toggleEnabled = () => {
    const enabled = !settings.ambientEnabled
    if (!enabled && listening) {
      stopAmbient(0.8)
      setListening(false)
    }
    updateSettings({ ambientEnabled: enabled })
  }

  const chooseSound = (sound: AmbientSound) => {
    updateSettings({ ambientSound: sound })
    if (listening) startAmbient(sound, settings.ambientVolume)
  }

  const changeVolume = (volume: number) => {
    setAmbientVolume(volume)
    updateSettings({ ambientVolume: volume })
  }

  const toggleListening = () => {
    if (listening) stopAmbient(0.8)
    else startAmbient(settings.ambientSound, settings.ambientVolume)
    setListening(!listening)
  }

  return (
    <section className="ambient" aria-labelledby="ambient-heading">
      <div className="ambient-row">
        <h2 id="ambient-heading">Ambient sound</h2>
        <button
          type="button"
          role="switch"
          className="switch"
          aria-checked={settings.ambientEnabled}
          aria-labelledby="ambient-heading"
          onClick={toggleEnabled}
        >
          <span className="switch-thumb" />
        </button>
      </div>

      <div className={`ambient-options${settings.ambientEnabled ? '' : ' is-off'}`}>
        <div className="ambient-sounds" role="radiogroup" aria-label="Sound">
          {SOUNDS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              className="ambient-sound"
              aria-checked={settings.ambientSound === s.id}
              disabled={!settings.ambientEnabled}
              onClick={() => chooseSound(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <label className="ambient-volume">
          <span>Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.ambientVolume}
            disabled={!settings.ambientEnabled}
            onChange={(e) => changeVolume(Number(e.target.value))}
          />
        </label>

        <button
          type="button"
          className="btn btn-outline ambient-listen"
          disabled={!settings.ambientEnabled}
          onClick={toggleListening}
        >
          {listening ? '■ Stop' : '▶ Listen'}
        </button>
      </div>
    </section>
  )
}
