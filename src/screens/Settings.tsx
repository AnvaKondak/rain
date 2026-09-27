import { Link } from 'react-router'
import AmbientSettings from '../components/AmbientSettings.tsx'
import BackupSettings from '../components/BackupSettings.tsx'
import { ABOUT_CREDIT, ABOUT_LINK } from '../content/about.ts'
import './Settings.css'

export default function Settings() {
  return (
    <main className="page">
      <header className="topbar">
        <Link className="link-quiet" to="/" aria-label="Back to home">‹ Home</Link>
      </header>
      <h1>Settings</h1>

      <ul className="settings-list">
        <li>
          <Link className="settings-row" to="/feelings">
            <span>Feelings</span>
            <span aria-hidden="true">›</span>
          </Link>
        </li>
      </ul>

      <AmbientSettings />
      <BackupSettings />

      <section className="about" aria-labelledby="about-heading">
        <h2 id="about-heading">About</h2>
        <p className="about-credit">{ABOUT_CREDIT}</p>
        <div className="about-links">
          <a className="about-link" href={ABOUT_LINK.url} target="_blank" rel="noopener noreferrer">
            {ABOUT_LINK.label} ›<span className="sr-only"> (opens in your browser)</span>
          </a>
          <Link className="about-link" to="/learn">
            Learn more about RAIN ›
          </Link>
        </div>
      </section>

      <ul className="settings-list">
        <li>
          <Link className="settings-row" to="/privacy">
            <span>Privacy</span>
            <span aria-hidden="true">›</span>
          </Link>
        </li>
      </ul>
    </main>
  )
}
