import './StepDots.css'

interface StepDotsProps {
  current: number
  total: number
}

export default function StepDots({ current, total }: StepDotsProps) {
  return (
    <div className="step-dots" role="img" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`step-dot${i < current ? ' is-done' : ''}${i === current ? ' is-current' : ''}`}
        />
      ))}
    </div>
  )
}
