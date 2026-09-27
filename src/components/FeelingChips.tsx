import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router'
import { db } from '../db/db.ts'
import { toggleFeeling } from '../session/draft.ts'
import './FeelingChips.css'

interface FeelingChipsProps {
  selected: string[]
}

export default function FeelingChips({ selected }: FeelingChipsProps) {
  const feelings = useLiveQuery(() => db.feelings.orderBy('order').toArray())
  if (!feelings) return null

  return (
    <div className="feeling-chips" role="group" aria-label="Feelings (choose any)">
      {feelings.map((f) => (
        <button
          key={f.id}
          type="button"
          className="feeling-chip"
          aria-pressed={selected.includes(f.label)}
          onClick={() => toggleFeeling(f.label)}
        >
          {f.label}
        </button>
      ))}
      <Link className="feeling-edit" to="/feelings" aria-label="Edit feelings">
        ✏️ Edit
      </Link>
    </div>
  )
}
