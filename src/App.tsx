import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Goals from './pages/Goals'
import Stats from './pages/Stats'
import Nav from './components/Nav'

const TITLES: Record<string, string> = {
  '/': 'Drop in the Bucket',
  '/goals': 'Your Goals',
  '/stats': 'Stats',
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="app">
      <header className="app-header">
        <h1>{TITLES[pathname] ?? 'Drop in the Bucket'}</h1>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>
      <Nav />
    </div>
  )
}
