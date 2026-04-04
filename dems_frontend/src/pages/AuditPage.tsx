import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import type { AuditResponse } from '../types'

export function AuditPage() {
  const api = useApi()
  const [rows, setRows] = useState<AuditResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const uid = userId ? Number(userId) : undefined
      const data = await api.listAudit({
        limit: 100,
        user_id:
          uid !== undefined && Number.isInteger(uid) && uid > 0 ? uid : undefined,
        search: search || undefined,
        from_date: fromDate ? new Date(fromDate).toISOString() : undefined,
        to_date: toDate ? new Date(toDate).toISOString() : undefined,
      })
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audit log')
    } finally {
      setLoading(false)
    }
  }, [api, userId, search, fromDate, toDate])

  useEffect(() => {
    const t = window.setTimeout(load, 300)
    return () => window.clearTimeout(t)
  }, [load])

  return (
    <div className="page">
      <h1>Audit log</h1>

      <div className="toolbar wrap">
        <label className="inline">
          User ID
          <input
            type="number"
            min={1}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Filter"
          />
        </label>
        <label className="inline">
          Search details
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Text in details"
          />
        </label>
        <label className="inline">
          From
          <input
            type="datetime-local"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>
        <label className="inline">
          To
          <input
            type="datetime-local"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>
        <button type="button" className="btn ghost" onClick={() => load()}>
          Refresh
        </button>
      </div>

      {error ? <p className="banner error">{error}</p> : null}
      {loading ? <p className="muted">Loading…</p> : null}

      <div className="table-wrap">
        <table className="data-table compact">
          <thead>
            <tr>
              <th>Log</th>
              <th>Time</th>
              <th>User</th>
              <th>Event</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.LogID}>
                <td>{r.LogID}</td>
                <td className="nowrap">{r.Timestamp ?? '—'}</td>
                <td>{r.UserID}</td>
                <td>{r.EventType}</td>
                <td className="details-cell">{r.Details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
