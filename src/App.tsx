import { Link, Navigate, Route, Routes, useLocation } from 'react-router'
import { NOT_AFFILIATED } from './content/about.ts'
import Home from './screens/Home.tsx'
import Learn from './screens/Learn.tsx'
import Feelings from './screens/Feelings.tsx'
import Pond from './screens/Pond.tsx'
import Practice from './screens/Practice.tsx'
import Privacy from './screens/Privacy.tsx'
import SessionDetail from './screens/SessionDetail.tsx'
import Settings from './screens/Settings.tsx'

export default function App() {
  const location = useLocation()
  // Fade on every screen change, except between practice steps, which
  // share one screen so the lotus stays mounted and can open smoothly.
  const inPractice = location.pathname.startsWith('/practice/')
  const screenKey = inPractice ? 'practice' : location.pathname

  return (
    <div className="app">
      <div className="screen" key={screenKey}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/practice/:step" element={<Practice />} />
          <Route path="/feelings" element={<Feelings />} />
          <Route path="/history" element={<Pond />} />
          <Route path="/history/:id" element={<SessionDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {/* Left off the practice itself, where it would only be noise. */}
      {!inPractice && (
        <footer className="app-footer">
          {NOT_AFFILIATED}{' '}
          <Link to="/privacy">Privacy</Link>
        </footer>
      )}
    </div>
  )
}
