import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import type { CaseOut, Role } from '../types'

export function CasesListPage() {
  const api = useApi()
  const { user } = useAuth()
  const role = user!.Role as Role

  const [rows, setRows] = useState<CaseOut[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [officerId, setOfficerId] = useState('')
  const [byOfficerLoading, setByOfficerLoading] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      if (role === 'officer') {
        const data = await api.listAssignedCases()
        setRows(data)
      } else {
        const data = await api.listCases({
          search: search || undefined,
          is_active: status || undefined,
          limit: 100,
        })
        setRows(data)
      }
    } catch (e) {
      setRows([])
      setError(e instanceof Error ? e.message : 'Failed to load cases')
    } finally {
      setLoading(false)
    }
  }, [api, role, search, status])

  useEffect(() => {
    if (role === 'officer') {
      load()
      return
    }
    const t = window.setTimeout(() => load(), 300)
    return () => window.clearTimeout(t)
  }, [load, role])

  async function loadByOfficer() {
    const id = Number(officerId)
    if (!Number.isInteger(id) || id < 1) {
      setError('Enter a valid officer User ID')
      return
    }
    setByOfficerLoading(true)
    setError(null)
    try {
      const data = await api.casesForOfficer(id)
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setByOfficerLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Cases</h1>
        {role === 'inspector' ? (
          <Link className="btn primary" to="/cases/new">
            New case
          </Link>
        ) : null}
      </div>

      {role !== 'officer' ? (
        <div className="toolbar">
          <label className="inline">
            Search title
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Partial title…"
            />
          </label>
          <label className="inline">
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Any</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </label>
          <button type="button" className="btn ghost" onClick={() => load()}>
            Refresh
          </button>
        </div>
      ) : null}

      {role === 'admin' ? (
        <div className="panel subpanel">
          <h3>Cases assigned to an officer</h3>
          <p className="muted small">
            Enter an officer&apos;s <code>UserID</code> (from the Users screen).
          </p>
          <div className="row gap">
            <input
              type="number"
              min={1}
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              placeholder="Officer UserID"
            />
            <button
              type="button"
              className="btn primary"
              disabled={byOfficerLoading}
              onClick={loadByOfficer}
            >
              Load
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setOfficerId('')
                load()
              }}
            >
              Reset to all cases
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="banner error">{error}</p> : null}
      {loading ? <p className="muted">Loading…</p> : null}

      {!loading && rows.length === 0 ? (
        <p className="muted">No cases found.</p>
      ) : null}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Opened</th>
              {role !== 'officer' ? <th>Inspector ID</th> : null}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.CaseID}>
                <td>{c.CaseID}</td>
                <td>{c.Title}</td>
                <td>{c.Type}</td>
                <td>{c.Status}</td>
                <td className="nowrap">{c.DateOpened?.slice(0, 10)}</td>
                {role !== 'officer' ? <td>{c.ActingInspectorID}</td> : null}
                <td>
                  <Link className="btn text" to={`/cases/${c.CaseID}`}>
                    Open
                  </Link>
                  <Link className="btn text" to={`/evidence/${c.CaseID}`}>
                    Evidence
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
