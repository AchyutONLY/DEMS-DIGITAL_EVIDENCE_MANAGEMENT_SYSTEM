import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import type { CustodyResponse, Role } from '../types'

export function CustodyPage() {
  const api = useApi()
  const { user } = useAuth()
  const role = user!.Role as Role

  const [rows, setRows] = useState<CustodyResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterEv, setFilterEv] = useState('')
  const [filterOff, setFilterOff] = useState('')

  const [evId, setEvId] = useState('')
  const [actOff, setActOff] = useState('')
  const [notes, setNotes] = useState('')

  const [edit, setEdit] = useState<CustodyResponse | null>(null)
  const [eNotes, setENotes] = useState('')
  const [eAct, setEAct] = useState('')
  const [eTs, setETs] = useState('')

  const canCreate = role === 'inspector'
  const canUpdate = role === 'inspector' || role === 'admin'
  const canDelete = role === 'admin'

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const ev = filterEv ? Number(filterEv) : undefined
      const of = filterOff ? Number(filterOff) : undefined
      const data = await api.listCustody({
        limit: 200,
        Evidence_id:
          ev !== undefined && Number.isInteger(ev) && ev > 0 ? ev : undefined,
        ActingOfficerID:
          of !== undefined && Number.isInteger(of) && of > 0 ? of : undefined,
      })
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [api, filterEv, filterOff])

  useEffect(() => {
    const t = window.setTimeout(load, 250)
    return () => window.clearTimeout(t)
  }, [load])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    const eid = Number(evId)
    const oid = Number(actOff)
    if (!Number.isInteger(eid) || !Number.isInteger(oid)) {
      setError('Evidence ID and acting officer ID must be integers')
      return
    }
    setError(null)
    try {
      await api.createCustody({
        EvidenceID: eid,
        ActingOfficerID: oid,
        Notes: notes || null,
      })
      setEvId('')
      setActOff('')
      setNotes('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    }
  }

  function openEdit(r: CustodyResponse) {
    setEdit(r)
    setENotes(r.Notes ?? '')
    setEAct(String(r.ActingOfficerID))
    setETs(r.Timestamp ? r.Timestamp.slice(0, 16) : '')
  }

  async function onSaveEdit(ev: FormEvent) {
    ev.preventDefault()
    if (!edit) return
    setError(null)
    try {
      const body: {
        Notes?: string | null
        ActingOfficerID?: number
        Timestamp?: string | null
      } = { Notes: eNotes || null }
      if (eAct.trim()) {
        const oid = Number(eAct)
        if (Number.isInteger(oid) && oid > 0) body.ActingOfficerID = oid
      }
      if (eTs) body.Timestamp = new Date(eTs).toISOString()
      await api.updateCustody(edit.RecordID, body)
      setEdit(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function onDelete(r: CustodyResponse) {
    if (!confirm(`Delete custody record #${r.RecordID}?`)) return
    setError(null)
    try {
      await api.deleteCustody(r.RecordID)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="page">
      <h1>Custody</h1>

      <div className="toolbar">
        <label className="inline">
          Evidence ID
          <input
            value={filterEv}
            onChange={(e) => setFilterEv(e.target.value)}
            placeholder="Filter"
          />
        </label>
        <label className="inline">
          Acting officer ID
          <input
            value={filterOff}
            onChange={(e) => setFilterOff(e.target.value)}
            placeholder="Filter"
          />
        </label>
        <button type="button" className="btn ghost" onClick={() => load()}>
          Refresh
        </button>
      </div>

      {error ? <p className="banner error">{error}</p> : null}

      {canCreate ? (
        <div className="panel">
          <h2>New custody record</h2>
          <form className="stack-form narrow" onSubmit={onCreate}>
            <label>
              Evidence ID *
              <input
                type="number"
                min={1}
                value={evId}
                onChange={(e) => setEvId(e.target.value)}
                required
              />
            </label>
            <label>
              Acting officer User ID *
              <input
                type="number"
                min={1}
                value={actOff}
                onChange={(e) => setActOff(e.target.value)}
                required
              />
            </label>
            <label>
              Notes
              <input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <button type="submit" className="btn primary">
              Create
            </button>
          </form>
        </div>
      ) : null}

      {loading ? <p className="muted">Loading…</p> : null}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Record</th>
              <th>Evidence</th>
              <th>Officer</th>
              <th>Timestamp</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.RecordID}>
                <td>{r.RecordID}</td>
                <td>{r.EvidenceID}</td>
                <td>{r.ActingOfficerID}</td>
                <td className="nowrap">{r.Timestamp ?? '—'}</td>
                <td>{r.Notes ?? '—'}</td>
                <td className="nowrap">
                  {canUpdate ? (
                    <button type="button" className="btn text" onClick={() => openEdit(r)}>
                      Edit
                    </button>
                  ) : null}
                  {canDelete ? (
                    <button type="button" className="btn text danger" onClick={() => onDelete(r)}>
                      Delete
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit ? (
        <div className="modal-backdrop" role="dialog">
          <div className="modal wide">
            <h3>Edit record #{edit.RecordID}</h3>
            <form className="stack-form" onSubmit={onSaveEdit}>
              <label>
                Acting officer ID
                <input
                  type="number"
                  min={1}
                  value={eAct}
                  onChange={(e) => setEAct(e.target.value)}
                />
              </label>
              <label>
                Timestamp (local)
                <input
                  type="datetime-local"
                  value={eTs}
                  onChange={(e) => setETs(e.target.value)}
                />
              </label>
              <label>
                Notes
                <input value={eNotes} onChange={(e) => setENotes(e.target.value)} />
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
