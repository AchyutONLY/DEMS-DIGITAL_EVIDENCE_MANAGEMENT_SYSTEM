// ─── DEMS API Service ──────────────────────────────────────────────────────────
// Change this to your backend URL
export const API_BASE = 'http://localhost:8000';

const apiFetch = async (path, token, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
  if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = async (badgeNumber, password) => {
  const body = new URLSearchParams({ username: badgeNumber, password });
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json().catch(() => ({ detail: 'Login failed' }));
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data; // { access_token, token_type }
};

export const getMe = (token) => apiFetch('/me', token);

export const changePassword = (token, oldPassword, newPassword) =>
  apiFetch('/users/change-password', token, {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });

// ── Users (Admin only) ────────────────────────────────────────────────────────
export const getUsers = (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/users/${q ? '?' + q : ''}`, token);
};

export const getActiveOfficers = (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/users/officers/active${q ? '?' + q : ''}`, token);
};

export const createUser = (token, data) =>
  apiFetch('/users/', token, { method: 'POST', body: JSON.stringify(data) });

export const updateUser = (token, badgeNum, data) =>
  apiFetch(`/users/${badgeNum}`, token, { method: 'PUT', body: JSON.stringify(data) });

export const deleteUser = (token, badgeNum) =>
  apiFetch(`/users/${badgeNum}`, token, { method: 'DELETE' });

// ── Cases ─────────────────────────────────────────────────────────────────────
// Admin + Inspector: all cases
export const getCases = (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/cases/${q ? '?' + q : ''}`, token);
};

// Inspector (own) + Officer (assigned to)
export const getAssignedCases = (token) => apiFetch('/cases/assigned', token);

// Admin + Inspector: cases assigned to a specific officer
export const getCasesForOfficer = (token, officerId) =>
  apiFetch(`/cases/assigned/${officerId}`, token);

// Inspector (own case): officers assigned to a case
export const getAssignedOfficers = (token, caseId) =>
  apiFetch(`/cases/assigned-officers/${caseId}`, token);

// Inspector only
export const createCase = (token, data) =>
  apiFetch('/cases/', token, { method: 'POST', body: JSON.stringify(data) });

export const updateCase = (token, caseId, data) =>
  apiFetch(`/cases/${caseId}`, token, { method: 'PUT', body: JSON.stringify(data) });

export const closeCase = (token, caseId) =>
  apiFetch(`/cases/${caseId}/close`, token, { method: 'PUT' });

export const reactivateCase = (token, caseId) =>
  apiFetch(`/cases/${caseId}/reactivate`, token, { method: 'PUT' });

// Admin only
export const deleteCase = (token, caseId) =>
  apiFetch(`/cases/${caseId}`, token, { method: 'DELETE' });

// Inspector (own case)
export const assignOfficers = (token, caseId, officerIds) =>
  apiFetch(`/cases/${caseId}/assign`, token, {
    method: 'POST',
    body: JSON.stringify({ officer_ids: officerIds }),
  });

export const removeOfficers = (token, caseId, officerIds) =>
  apiFetch(`/cases/${caseId}/remove-officers`, token, {
    method: 'POST',
    body: JSON.stringify({ officer_ids: officerIds }),
  });

// ── Evidence ──────────────────────────────────────────────────────────────────
// Inspector + Officer (own/assigned case) — multipart
export const addEvidence = (token, formData) =>
  apiFetch('/evidence/', token, { method: 'POST', body: formData });

// Any authenticated user
export const listEvidence = (token, caseId, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/evidence/case/${caseId}${q ? '?' + q : ''}`, token);
};

// Officer + Inspector (own/assigned case)
export const updateEvidence = (token, caseId, evidenceId, data) =>
  apiFetch(`/evidence/${caseId}/${evidenceId}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// Admin only
export const deleteEvidence = (token, evidenceId) =>
  apiFetch(`/evidence/${evidenceId}`, token, { method: 'DELETE' });

// Any authenticated — returns download URL
export const getEvidenceDownloadUrl = (caseId, evidenceId, token) =>
  `${API_BASE}/evidence/${caseId}/${evidenceId}/download?token=${token}`;

export const downloadEvidence = async (token, caseId, evidenceId) => {
  const res = await fetch(`${API_BASE}/evidence/${caseId}/${evidenceId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const cd = res.headers.get('content-disposition') || '';
  const match = cd.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : `evidence_${evidenceId}`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ── Custody ───────────────────────────────────────────────────────────────────
// Any authenticated
export const getCustody = (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/custody/${q ? '?' + q : ''}`, token);
};

export const getCustodyRecord = (token, recordId) =>
  apiFetch(`/custody/${recordId}`, token);

// Inspector only
export const addCustody = (token, data) =>
  apiFetch('/custody/', token, { method: 'POST', body: JSON.stringify(data) });

// Inspector only
export const updateCustody = (token, recordId, data) =>
  apiFetch(`/custody/${recordId}`, token, { method: 'PUT', body: JSON.stringify(data) });

// Admin only
export const deleteCustody = (token, recordId) =>
  apiFetch(`/custody/${recordId}`, token, { method: 'DELETE' });

// ── Audit (Admin only) ────────────────────────────────────────────────────────
export const getAuditLogs = (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/audit/${q ? '?' + q : ''}`, token);
};