import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { parseIdList } from '../utils/ids'
import type { AssignedOfficerRow, CaseOut, Role } from '../types'

export function CaseDetailPage() {
  const { caseId } = useParams()
  const id = Number(caseId)
  const api = useApi()
  const { user } = useAuth()
  const navigate = useNavigate()
  const role = user!.Role as Role

  const [c, setC] = useState<CaseOut | null>(null)
  const [officers, setOfficers] = useState<AssignedOfficerRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [editTitle, setEditTitle] = useState('')
  const [editType, setEditType] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [assignRaw, setAssignRaw] = useState('')
  const [removeRaw, setRemoveRaw] = useState('')
  const [busy, setBusy] = useState(false)

  const isOwnInspector =
    role === 'inspector' && c && c.ActingInspectorID === user!.UserID

  const loadCase = useCallback(async () => {
    if (!Number.isInteger(id) || id < 1) {
      setError('Invalid case ID')
      setLoading(false)
      return
    }
    setError(null)
    setLoading(true)
    try {
      let list: CaseOut[]
      if (role === 'officer') {
        list = await api.listAssignedCases()
      } else {
        list = await api.listCases({ limit: 500 })
      }
      const found = list.find((x) => x.CaseID === id) ?? null
      setC(found)
      if (found) {
        setEditTitle(found.Title)
        setEditType(found.Type)
        setEditStatus(found.Status)
        setEditDesc(found.Description ?? '')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load case')
      setC(null)
    } finally {
      setLoading(false)
    }
  }, [api, id, role])

  const loadOfficers = useCallback(async () => {
    if (!c || role === 'officer') return
    try {
      const data = await api.getAssignedOfficers(c.CaseID)
      setOfficers(data)
    } catch {
      setOfficers(null)
    }
  }, [api, c, role])

  useEffect(() => {
    loadCase()
  }, [loadCase])

  useEffect(() => {
    if (c && role !== 'officer') loadOfficers()
  }, [c, loadOfficers, role])

  async function saveEdits() {
    if (!c) return
    setBusy(true)
    setError(null)
    try {
      const updated = await api.updateCase(c.CaseID, {
        Title: editTitle,
        Type: editType,
        Status: editStatus,
        Description: editDesc || null,
      })
      setC(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  async function closeCase() {
    if (!c || !confirm('Close this case? It will be marked INACTIVE.')) return
    setBusy(true)
    setError(null)
    try {
      const updated = await api.closeCase(c.CaseID)
      setC(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not close')
    } finally {
      setBusy(false)
    }
  }

  async function assign() {
    if (!c) return
    const officer_ids = parseIdList(assignRaw)
    if (officer_ids.length === 0) {
      setError('Enter at least one officer User ID')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.assignOfficers(c.CaseID, officer_ids)
      setAssignRaw('')
      await loadOfficers()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assign failed')
    } finally {
      setBusy(false)
    }
  }

  async function removeOffs() {
    if (!c) return
    const officer_ids = parseIdList(removeRaw)
    if (officer_ids.length === 0) {
      setError('Enter officer User IDs to remove')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.removeOfficers(c.CaseID, officer_ids)
      setRemoveRaw('')
      await loadOfficers()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Remove failed')
    } finally {
      setBusy(false)
    }
  }

  async function deleteCase() {
    if (!c || !confirm('Permanently delete this case?')) return
    setBusy(true)
    setError(null)
    try {
      await api.deleteCase(c.CaseID)
      navigate('/cases')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  if (!Number.isInteger(id) || id < 1) {
    return <p className="banner error">Invalid case ID</p>
  }

  if (loading) return <p className="muted">Loading case…</p>
  if (!c) {
    return (
      <div className="page">
        <p className="banner error">{error ?? 'Case not found or not accessible.'}</p>
        <Link to="/cases">Back to cases</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>
          Case #{c.CaseID}: {c.Title}
        </h1>
        <div className="row gap">
          <Link className="btn ghost" to="/cases">
            All cases
          </Link>
          <Link className="btn primary" to={`/evidence/${c.CaseID}`}>
            Evidence
          </Link>
        </div>
      </div>

      {error ? <p className="banner error">{error}</p> : null}

      <div className="panel">
        <h2>Summary</h2>
        <dl className="kv">
          <dt>Type</dt>
          <dd>{c.Type}</dd>
          <dt>Status</dt>
          <dd>{c.Status}</dd>
          <dt>Opened</dt>
          <dd>{c.DateOpened}</dd>
          <dt>Closed</dt>
          <dd>{c.DateClosed ?? '—'}</dd>
          <dt>Acting inspector ID</dt>
          <dd>{c.ActingInspectorID}</dd>
          <dt>Description</dt>
          <dd>{c.Description || '—'}</dd>
        </dl>
      </div>

      {role === 'admin' ? (
        <div className="panel danger-zone">
          <h2>Admin</h2>
          <button
            type="button"
            className="btn danger"
            disabled={busy}
            onClick={deleteCase}
          >
            Delete case
          </button>
        </div>
      ) : null}

      {isOwnInspector ? (
        <>
          <div className="panel">
            <h2>Edit case</h2>
            <div className="stack-form">
              <label>
                Title
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </label>
              <label>
                Type
                <input value={editType} onChange={(e) => setEditType(e.target.value)} />
              </label>
              <label>
                Status
                <input value={editStatus} onChange={(e) => setEditStatus(e.target.value)} />
              </label>
              <label>
                Description
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                />
              </label>
              <button type="button" className="btn primary" disabled={busy} onClick={saveEdits}>
                Save changes
              </button>
            </div>
          </div>
          <div className="panel">
            <h2>Close case</h2>
            <p className="muted small">Sets status to INACTIVE and records close time.</p>
            <button type="button" className="btn ghost" disabled={busy} onClick={closeCase}>
              Close case
            </button>
          </div>
          <div className="panel">
            <h2>Assigned officers</h2>
            {officers === null ? (
              <p className="muted">Could not load list (check permissions).</p>
            ) : officers.length === 0 ? (
              <p className="muted">No officers assigned.</p>
            ) : (
              <ul className="plain-list">
                {officers.map((o) => (
                  <li key={o.UserID}>
                    <strong>{o.Name}</strong> (ID {o.UserID}, badge {o.BadgeNumber})
                  </li>
                ))}
              </ul>
            )}
            <h3>Assign officers</h3>
            <div className="row gap wrap">
              <input
                value={assignRaw}
                onChange={(e) => setAssignRaw(e.target.value)}
                placeholder="Officer User IDs"
              />
              <button type="button" className="btn primary" disabled={busy} onClick={assign}>
                Assign
              </button>
            </div>
            <h3>Remove officers</h3>
            <div className="row gap wrap">
              <input
                value={removeRaw}
                onChange={(e) => setRemoveRaw(e.target.value)}
                placeholder="Officer User IDs"
              />
              <button type="button" className="btn ghost" disabled={busy} onClick={removeOffs}>
                Remove
              </button>
            </div>
          </div>
        </>
      ) : null}

      {role === 'inspector' && !isOwnInspector ? (
        <p className="banner warn">
          You are not the acting inspector for this case. Editing and assignments are disabled.
        </p>
      ) : null}

    </div>
  )
}
