import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { parseIdList } from '../utils/ids'

export function CaseNewPage() {
  const api = useApi()
  const navigate = useNavigate()
  const [Title, setTitle] = useState('')
  const [Type, setType] = useState('')
  const [Status, setStatus] = useState('ACTIVE')
  const [Description, setDescription] = useState('')
  const [officerIdsRaw, setOfficerIdsRaw] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const c = await api.createCase({
        Title,
        Type,
        Status,
        Description: Description || null,
        AssignedOfficerIDs: parseIdList(officerIdsRaw),
      })
      navigate(`/cases/${c.CaseID}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create case')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page narrow">
      <h1>New case</h1>
      <p className="muted">
        Assign officers by their numeric <code>UserID</code> (comma-separated). Leave blank to
        assign later from the case page.
      </p>
      {error ? <p className="banner error">{error}</p> : null}
      <form className="stack-form" onSubmit={onSubmit}>
        <label>
          Title *
          <input value={Title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Type *
          <input value={Type} onChange={(e) => setType(e.target.value)} required />
        </label>
        <label>
          Status *
          <select value={Status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </label>
        <label>
          Description
          <textarea
            value={Description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>
        <label>
          Officer User IDs (optional)
          <input
            value={officerIdsRaw}
            onChange={(e) => setOfficerIdsRaw(e.target.value)}
            placeholder="e.g. 3, 5, 7"
          />
        </label>
        <div className="row gap">
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create case'}
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
