import { Link, useNavigate } from 'react-router'
import { PRIVACY_INTRO, PRIVACY_SECTIONS, PRIVACY_UPDATED } from '../content/privacy.ts'
import './Privacy.css'

export default function Privacy() {
  const navigate = useNavigate()
  return (
    <main className="page privacy">
      <header className="topbar">
        {/* Reached from Settings or the footer on any screen: go back to it. */}
        <Link
          className="link-quiet"
          to="/"
          onClick={(e) => {
            if (window.history.state?.idx > 0) {
              e.preventDefault()
              navigate(-1)
            }
          }}
        >
          ‹ Back
        </Link>
      </header>
      <h1>Privacy</h1>
      <p className="page-intro">{PRIVACY_INTRO}</p>

      {PRIVACY_SECTIONS.map((section) => (
        <section key={section.heading} className="privacy-section">
          <h2>{section.heading}</h2>
          <p>{section.text}</p>
        </section>
      ))}

      <p className="privacy-updated">Last updated {PRIVACY_UPDATED}</p>
    </main>
  )
}
