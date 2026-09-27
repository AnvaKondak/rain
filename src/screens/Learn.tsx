import { Link, useLocation } from 'react-router'
import { ORIGINAL_RAIN, RESOURCE_SECTIONS, RESOURCES_INTRO } from '../content/resources.ts'
import './Learn.css'

interface LearnState {
  /** Where the back link goes: the pond when opened from After the rain. */
  back?: string
  /** Passed on to the pond so the new lotus still drifts in. */
  arrived?: string
}

export default function Learn() {
  const { state } = useLocation() as { state: LearnState | null }
  const back = state?.back ?? '/'

  return (
    <main className="page learn">
      <header className="topbar">
        <Link
          className="link-quiet"
          to={back}
          state={state?.arrived ? { arrived: state.arrived } : undefined}
          replace
        >
          {back === '/history' ? '‹ Pond' : '‹ Home'}
        </Link>
      </header>

      <h1>Learn more about RAIN</h1>
      <p className="page-intro">{RESOURCES_INTRO}</p>

      <section className="learn-section">
        <h2>{ORIGINAL_RAIN.heading}</h2>
        <p className="learn-history">{ORIGINAL_RAIN.intro}</p>
        <dl className="learn-original">
          {ORIGINAL_RAIN.steps.map((s) => (
            <div key={s.name}>
              <dt>{s.name}</dt>
              <dd>{s.line}</dd>
            </div>
          ))}
        </dl>
        <p className="learn-history">{ORIGINAL_RAIN.outro}</p>
        <ul className="learn-list">
          {ORIGINAL_RAIN.links.map((item) => (
            <li key={item.url}>
              <a className="resource" href={item.url} target="_blank" rel="noopener noreferrer">
                <span className="resource-title">{item.title}</span>
                <span className="resource-author">{item.author}</span>
                <span className="resource-note">{item.note}</span>
                <span className="sr-only"> (opens in your browser)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {RESOURCE_SECTIONS.map((section) => (
        <section key={section.heading} className="learn-section">
          <h2>{section.heading}</h2>
          <ul className="learn-list">
            {section.items.map((item) => (
              <li key={item.url}>
                <a className="resource" href={item.url} target="_blank" rel="noopener noreferrer">
                  <span className="resource-title">
                    {item.title}
                    {item.pick && (
                      <span className="resource-pick" role="img" aria-label="a favorite">
                        {' '}
                        🪷
                      </span>
                    )}
                  </span>
                  {item.author && <span className="resource-author">{item.author}</span>}
                  <span className="resource-note">{item.note}</span>
                  <span className="sr-only"> (opens in your browser)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
