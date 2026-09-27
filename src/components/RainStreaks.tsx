import { useEffect, useRef } from 'react'
import './RainStreaks.css'

interface RainStreaksProps {
  /** 0–1: how hard it's raining. Changes ease in over a few seconds. */
  intensity: number
}

interface Drop {
  x: number
  y: number
  len: number
  speed: number
  alpha: number
  landAt: number // y where it meets the water
}

interface Ripple {
  x: number
  y: number
  age: number
}

const MAX_DROPS_PER_SEC = 34
const RIPPLE_SEC = 0.9
const EASE_SEC = 1.5 // how quickly density follows intensity (~3s to settle)
const SLANT = 0.12 // horizontal drift per unit fall

/** Faint rain behind the lotus whose density follows the step's intensity. */
export default function RainStreaks({ intensity }: RainStreaksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const target = useRef(intensity)

  useEffect(() => {
    target.current = intensity
  }, [intensity])

  useEffect(() => {
    const canvas = canvasRef.current
    const g = canvas?.getContext('2d')
    if (!canvas || !g || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let width = 0
    let height = 0
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const drops: Drop[] = []
    const ripples: Ripple[] = []
    let level = 0 // eased toward the target intensity
    let spawnDebt = 0
    let last = performance.now()
    let frame = 0

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      level += (target.current - level) * Math.min(1, dt / EASE_SEC)
      // Easing never quite arrives; snap so the rain can actually stop.
      if (Math.abs(target.current - level) < 0.02) level = target.current

      spawnDebt += level * MAX_DROPS_PER_SEC * dt
      while (spawnDebt >= 1) {
        spawnDebt -= 1
        const len = 10 + Math.random() * 14
        drops.push({
          x: Math.random() * width * 1.1 - width * 0.1,
          y: -len,
          len,
          speed: 240 + Math.random() * 140,
          alpha: 0.18 + Math.random() * 0.22,
          landAt: height * (0.72 + Math.random() * 0.2),
        })
      }

      const color = getComputedStyle(canvas).color
      g.clearRect(0, 0, width, height)
      g.strokeStyle = color
      g.lineCap = 'round'

      g.lineWidth = 1
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]
        d.y += d.speed * dt
        d.x += d.speed * dt * SLANT
        if (d.y >= d.landAt) {
          ripples.push({ x: d.x, y: d.landAt, age: 0 })
          drops.splice(i, 1)
          continue
        }
        g.globalAlpha = d.alpha
        g.beginPath()
        g.moveTo(d.x, d.y)
        g.lineTo(d.x - d.len * SLANT, d.y - d.len)
        g.stroke()
      }

      g.lineWidth = 0.8
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.age += dt
        const t = r.age / RIPPLE_SEC
        if (t >= 1) {
          ripples.splice(i, 1)
          continue
        }
        g.globalAlpha = 0.35 * (1 - t)
        g.beginPath()
        g.ellipse(r.x, r.y, 2 + t * 12, 0.8 + t * 3, 0, 0, Math.PI * 2)
        g.stroke()
      }
      g.globalAlpha = 1

      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="rain-streaks" aria-hidden="true" />
}
