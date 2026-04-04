import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useApi } from '../hooks/useApi'
import type { UserResponse } from '../types'

export function UsersPage() {
  const api = useApi()
  const [rows, setRows] = useState<UserResponse[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [showCreate, setShowCreate] = useState(false)
  const [cName, setCName] = useState('')
  const [cRole, setCRole] = useState('officer')
  const [cBadge, setCBadge] = useState('')
  const [cContact, setCContact] = useState('')
  const [cStatus, setCStatus] = useState('ACTIVE')
  const [cPassword, setCPassword] = useState('')

  const [edit, setEdit] = useState<UserResponse | null>(null)
  const [eName, setEName] = useState('')
  const [eRole, setERole] = useState('')
  const [eContact, setEContact] = useState('')
  const [eStatus, setEStatus] = useState('')
  const [ePassword, setEPassword] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.listUsers({ search: search || undefined, limit: 200 })
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [api, search])

  useEffect(() => {
    const t = window.setTimeout(load, 300)
    return () => window.clearTimeout(t)
  }, [load])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api.createUser({
        Name: cName,
        Role: cRole,
        BadgeNumber: cBadge,
        Contact: cContact || null,
        Status: cStatus,
        Password: cPassword,
      })
      setShowCreate(false)
      setCName('')
      setCBadge('')
      setCContact('')
      setCPassword('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    }
  }

  function openEdit(u: UserResponse) {
    setEdit(u)
    setEName(u.Name)
    setERole(u.Role)
    setEContact(u.Contact ?? '')
    setEStatus(u.Status)
    setEPassword('')
  }

  async function onSaveEdit(e: FormEvent) {
    e.preventDefault()
    if (!edit) return
    setError(null)
    try {
      const body: {
        Name?: string
        Role?: string
        Contact?: string | null
        Status?: string
        Password?: string
      } = {
        Name: eName,
        Role: eRole,
        Contact: eContact || null,
        Status: eStatus,
      }
      if (ePassword.trim()) body.Password = ePassword
      await api.updateUser(edit.BadgeNumber, body)
      setEdit(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function onDelete(u: UserResponse) {
    if (!confirm(`Delete user ${u.Name} (${u.BadgeNumber})?`)) return
    setError(null)
    try {
      await api.deleteUser(u.BadgeNumber)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Users</h1>
        <button type="button" className="btn primary" onClick={() => setShowCreate(true)}>
          New user
        </button>
      </div>

      <div className="toolbar">
        <label className="inline">
          Search name
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Partial name…"
          />
        </label>
        <button type="button" className="btn ghost" onClick={() => load()}>
          Refresh
        </button>
      </div>

      {error ? <p className="banner error">{error}</p> : null}
      {loading ? <p className="muted">Loading…</p> : null}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>UserID</th>
              <th>Name</th>
              <th>Badge</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.UserID}>
                <td>{u.UserID}</td>
                <td>{u.Name}</td>
                <td>{u.BadgeNumber}</td>
                <td>{u.Role}</td>
                <td>{u.Status}</td>
                <td className="nowrap">
                  <button type="button" className="btn text" onClick={() => openEdit(u)}>
                    Edit
                  </button>
                  <button type="button" className="btn text danger" onClick={() => onDelete(u)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate ? (
        <div className="modal-backdrop" role="dialog">
          <div className="modal wide">
            <h3>New user</h3>
            <form className="stack-form" onSubmit={onCreate}>
              <label>
                Name *
                <input value={cName} onChange={(e) => setCName(e.target.value)} required />
              </label>
              <label>
                Badge number *
                <input value={cBadge} onChange={(e) => setCBadge(e.target.value)} required />
              </label>
              <label>
                Role *
                <select value={cRole} onChange={(e) => setCRole(e.target.value)}>
                  <option value="officer">officer</option>
                  <option value="inspector">inspector</option>
                  <option value="admin">admin</option>
                </select>
              </label>
              <label>
                Contact
                <input value={cContact} onChange={(e) => setCContact(e.target.value)} />
              </label>
              <label>
                Status *
                <select value={cStatus} onChange={(e) => setCStatus(e.target.value)}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </label>
              <label>
                Password *
                <input
                  type="password"
                  value={cPassword}
                  onChange={(e) => setCPassword(e.target.value)}
                  required
                />
              </label>
              <div className="row gap">
                <button type="submit" className="btn primary">
                  Create
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {edit ? (
        <div className="modal-backdrop" role="dialog">
          <div className="modal wide">
            <h3>Edit {edit.BadgeNumber}</h3>
            <form className="stack-form" onSubmit={onSaveEdit}>
              <label>
                Name
                <input value={eName} onChange={(e) => setEName(e.target.value)} />
              </label>
              <label>
                Role
                <select value={eRole} onChange={(e) => setERole(e.target.value)}>
                  <option value="officer">officer</option>
                  <option value="inspector">inspector</option>
                  <option value="admin">admin</option>
                </select>
              </label>
              <label>
                Contact
                <input value={eContact} onChange={(e) => setEContact(e.target.value)} />
              </label>
              <label>
                Status
                <select value={eStatus} onChange={(e) => setEStatus(e.target.value)}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </label>
              <label>
                New password (optional)
                <input
                  type="password"
                  value={ePassword}
                  onChange={(e) => setEPassword(e.target.value)}
                />
              </label>
              <div className="row gap">
                <button type="submit" className="btn primary">
                  Save
                </button>
                <button type="button" className="btn ghost" onClick={() => setEdit(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
