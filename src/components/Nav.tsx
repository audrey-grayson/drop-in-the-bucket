import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Drops', icon: '🪣', end: true },
  { to: '/goals', label: 'Goals', icon: '🎯', end: false },
  { to: '/stats', label: 'Stats', icon: '📊', end: false },
]

// Bottom tab bar — thumb-reachable on phones, which is the primary target.
export default function Nav() {
  return (
    <nav className="tab-bar">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) => `tab${isActive ? ' active' : ''}`}
        >
          <span className="tab-icon" aria-hidden="true">
            {t.icon}
          </span>
          <span className="tab-label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
