import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { downloadEvidenceFile } from '../api/backend'
import type { EvidenceResponse, Role } from '../types'

export function EvidenceCasePage() {
  const { caseId } = useParams()
  const id = Number(caseId)
  const api = useApi()
  const { user, token } = useAuth()
  const role = user!.Role as Role

  const [rows, setRows] = useState<EvidenceResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [file, setFile] = useState<File | null>(null)
  const [Description, setDescription] = useState('')
  const [EvidenceType, setEvidenceType] = useState('')
  const [SourceOrigin, setSourceOrigin] = useState('')
  const [uploading, setUploading] = useState(false)

  const [editRow, setEditRow] = useState<EvidenceResponse | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editType, setEditType] = useState('')
  const [editSource, setEditSource] = useState('')

  const canUpload = role === 'inspector' || role === 'officer'
  const canDelete = role === 'admin'

  const load = useCallback(async () => {
    if (!Number.isInteger(id) || id < 1) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.listEvidence(id, { limit: 200 })
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load evidence')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [api, id])

  useEffect(() => {
    load()
  }, [load])

  async function onUpload(e: FormEvent) {
    e.preventDefault()
    if (!file || !token) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.set('CaseID', String(id))
      if (Description) fd.set('Description', Description)
      fd.set('EvidenceType', EvidenceType)
      fd.set('SourceOrigin', SourceOrigin)
      fd.set('file', file)
      await api.uploadEvidence(fd)
      setFile(null)
      setDescription('')
      setEvidenceType('')
      setSourceOrigin('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function saveEdit() {
    if (!editRow || !token) return
    setError(null)
    try {
      await api.updateEvidence(id, editRow.EvidenceID, {
        Description: editDesc || null,
        EvidenceType: editType || null,
        SourceOrigin: editSource || null,
      })
      setEditRow(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    }
  }

  async function removeEv(ev: EvidenceResponse) {
    if (!confirm(`Delete evidence #${ev.EvidenceID}?`)) return
    setError(null)
    try {
      await api.deleteEvidence(ev.EvidenceID)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  async function download(ev: EvidenceResponse) {
    if (!token) return
    setError(null)
    try {
      const base =
        ev.FilePath?.split(/[/\\]/).pop() ?? `evidence_${ev.EvidenceID}`
      await downloadEvidenceFile(token, id, ev.EvidenceID, base)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed')
    }
  }

  if (!Number.isInteger(id) || id < 1) {
    return <p className="banner error">Invalid case ID</p>
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Evidence · Case #{id}</h1>
        <Link className="btn ghost" to={`/cases/${id}`}>
          Case detail
        </Link>
      </div>

      {error ? <p className="banner error">{error}</p> : null}

      {canUpload ? (
        <div className="panel">
          <h2>Upload evidence</h2>
          <form className="stack-form" onSubmit={onUpload}>
            <label>
              File *
              <input
                type="file"
                required
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <label>
              Evidence type *
              <input
                value={EvidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                required
              />
            </label>
            <label>
              Source / origin *
              <input
                value={SourceOrigin}
                onChange={(e) => setSourceOrigin(e.target.value)}
                required
              />
            </label>
            <label>
              Description
              <input
                value={Description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <button type="submit" className="btn primary" disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </form>
        </div>
      ) : (
        <p className="muted">
          Admins cannot upload evidence in this system; use an inspector or officer account.
        </p>
      )}

      <div className="panel">
        <h2>Items</h2>
        {loading ? <p className="muted">Loading…</p> : null}
        {!loading && rows.length === 0 ? (
          <p className="muted">No evidence for this case.</p>
        ) : null}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Source</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((ev) => (
                <tr key={ev.EvidenceID}>
                  <td>{ev.EvidenceID}</td>
                  <td>{ev.EvidenceType}</td>
                  <td>{ev.SourceOrigin}</td>
                  <td>{ev.Description ?? '—'}</td>
                  <td className="nowrap">
                    <button
                      type="button"
                      className="btn text"
                      onClick={() => download(ev)}
                    >
                      Download
                    </button>
                    {role !== 'admin' ? (
                      <button
                        type="button"
                        className="btn text"
                        onClick={() => {
                          setEditRow(ev)
                          setEditDesc(ev.Description ?? '')
                          setEditType(ev.EvidenceType ?? '')
                          setEditSource(ev.SourceOrigin ?? '')
                        }}
                      >
                        Edit
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button
                        type="button"
                        className="btn text danger"
                        onClick={() => removeEv(ev)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editRow ? (
        <div className="modal-backdrop" role="dialog">
          <div className="modal">
            <h3>Edit evidence #{editRow.EvidenceID}</h3>
            <label>
              Description
              <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </label>
            <label>
              Type
              <input value={editType} onChange={(e) => setEditType(e.target.value)} />
            </label>
            <label>
              Source
              <input value={editSource} onChange={(e) => setEditSource(e.target.value)} />
            </label>
            <div className="row gap">
              <button type="button" className="btn primary" onClick={saveEdit}>
                Save
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setEditRow(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
