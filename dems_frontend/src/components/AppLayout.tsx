import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'nav-link active' : 'nav-link'
}

export function AppLayout() {
  const { user, logout } = useAuth()
  if (!user) return null

  const role = user.Role as Role

  return (
    <div className="app-root">
      <aside className="sidebar">
        <div className="brand">DEMS</div>
        <nav className="side-nav">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/cases" className={navClass}>
            Cases
          </NavLink>
          {role === 'inspector' ? (
            <NavLink to="/cases/new" className={navClass}>
              New case
            </NavLink>
          ) : null}
          <NavLink to="/custody" className={navClass}>
            Custody
          </NavLink>
          {role === 'admin' ? (
            <>
              <NavLink to="/users" className={navClass}>
                Users
              </NavLink>
              <NavLink to="/audit" className={navClass}>
                Audit log
              </NavLink>
            </>
          ) : null}
        </nav>
        <div className="side-footer">
          <div className="user-chip">
            <span className="user-name">{user.Name}</span>
            <span className="user-meta">
              {role} · {user.BadgeNumber}
            </span>
          </div>
          <button type="button" className="btn ghost small" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main-area">
        <Outlet />
      </main>
    </div>
  )
}
