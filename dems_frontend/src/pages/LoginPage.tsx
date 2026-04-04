import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login, user, loading, error } = useAuth()
  const [badge, setBadge] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/'

  if (!loading && user) {
    return <Navigate to={from === '/login' ? '/' : from} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(badge.trim(), password)
    } catch {
      /* surfaced via context */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>DEMS</h1>
        <p className="auth-sub">Sign in with badge number and password</p>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Badge number
            <input
              name="username"
              autoComplete="username"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              required
              disabled={submitting}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
            />
          </label>
          {error ? <p className="auth-error">{error}</p> : null}
          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
