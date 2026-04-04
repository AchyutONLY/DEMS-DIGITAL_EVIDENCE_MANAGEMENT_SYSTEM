import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

export function HomePage() {
  const { user } = useAuth()
  if (!user) return null
  const role = user.Role as Role

  return (
    <div className="page">
      <h1>Welcome, {user.Name}</h1>
      <p className="muted">
        You are signed in as <strong>{role}</strong> (badge {user.BadgeNumber}).
      </p>

      <div className="card-grid">
        <Link className="card link-card" to="/cases">
          <h2>Cases</h2>
          <p>
            {role === 'officer'
              ? 'View cases assigned to you.'
              : role === 'inspector'
                ? 'Browse all cases or manage your own investigations.'
                : 'Browse and delete cases, or inspect assignments by officer.'}
          </p>
        </Link>
        <Link className="card link-card" to="/custody">
          <h2>Custody</h2>
          <p>Chain-of-custody records linked to evidence.</p>
        </Link>
        {role === 'inspector' ? (
          <Link className="card link-card" to="/cases/new">
            <h2>New case</h2>
            <p>Open a new case and optionally assign officers.</p>
          </Link>
        ) : null}
        {role === 'admin' ? (
          <>
            <Link className="card link-card" to="/users">
              <h2>Users</h2>
              <p>Create and manage accounts (badge number login).</p>
            </Link>
            <Link className="card link-card" to="/audit">
              <h2>Audit log</h2>
              <p>Review system activity.</p>
            </Link>
          </>
        ) : null}
      </div>
    </div>
  )
}
