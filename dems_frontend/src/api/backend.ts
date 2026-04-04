import type {
  AssignedOfficerRow,
  AuditResponse,
  CaseCreateBody,
  CaseOut,
  CaseUpdateBody,
  CustodyCreateBody,
  CustodyResponse,
  CustodyUpdateBody,
  EvidenceResponse,
  EvidenceUpdateBody,
  UserCreateBody,
  UserResponse,
  UserUpdateBody,
} from '../types'

export async function parseApiError(res: Response): Promise<string> {
  const body = await res.json().catch(() => null) as {
    detail?: string | Array<{ msg?: string }>
  } | null
  if (!body) return res.statusText || 'Request failed'
  if (typeof body.detail === 'string') return body.detail
  if (Array.isArray(body.detail))
    return body.detail.map((x) => x.msg ?? JSON.stringify(x)).join(', ')
  return 'Request failed'
}

function buildUrl(path: string, params?: Record<string, string | number | undefined | null>) {
  if (!params) return path
  const u = new URL(path, window.location.origin)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v))
  }
  return u.pathname + u.search
}

async function req<T>(
  token: string,
  path: string,
  init?: RequestInit & { params?: Record<string, string | number | undefined | null> }
): Promise<T> {
  const url = init?.params ? buildUrl(path, init.params) : path
  const { params: _p, ...rest } = init ?? {}
  const isForm = rest.body instanceof FormData
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    ...(rest.headers as Record<string, string>),
  }
  if (!isForm && rest.body !== undefined) {
    ;(headers as Record<string, string>)['Content-Type'] = 'application/json'
  }
  const res = await fetch(url, { ...rest, headers })
  if (res.status === 204) return undefined as T
  if (!res.ok) throw new Error(await parseApiError(res))
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export function createApi(token: string) {
  return {
    listCases: (q?: {
      limit?: number
      skip?: number
      search?: string
      is_active?: string
    }) =>
      req<CaseOut[]>(token, '/cases/', {
        method: 'GET',
        params: {
          limit: q?.limit ?? 50,
          skip: q?.skip ?? 0,
          search: q?.search,
          is_active: q?.is_active,
        },
      }),

    listAssignedCases: () => req<CaseOut[]>(token, '/cases/assigned', { method: 'GET' }),

    createCase: (body: CaseCreateBody) =>
      req<CaseOut>(token, '/cases/', { method: 'POST', body: JSON.stringify(body) }),

    updateCase: (caseId: number, body: CaseUpdateBody) =>
      req<CaseOut>(token, `/cases/${caseId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    closeCase: (caseId: number) =>
      req<CaseOut>(token, `/cases/${caseId}/close`, { method: 'PUT' }),

    deleteCase: (caseId: number) =>
      req<void>(token, `/cases/${caseId}`, { method: 'DELETE' }),

    assignOfficers: (caseId: number, officer_ids: number[]) =>
      req<{ message: string }>(token, `/cases/${caseId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ officer_ids }),
      }),

    removeOfficers: (caseId: number, officer_ids: number[]) =>
      req<void>(token, `/cases/${caseId}/remove-officers`, {
        method: 'POST',
        body: JSON.stringify({ officer_ids }),
      }),

    getAssignedOfficers: (caseId: number) =>
      req<AssignedOfficerRow[]>(token, `/cases/assigned-officers/${caseId}`, {
        method: 'GET',
      }),

    casesForOfficer: (officerId: number) =>
      req<CaseOut[]>(token, `/cases/assigned/${officerId}`, { method: 'GET' }),

    listUsers: (q?: {
      limit?: number
      skip?: number
      search?: string
      badge_num?: string
      status_isActive?: string
    }) =>
      req<UserResponse[]>(token, '/users/', {
        method: 'GET',
        params: {
          limit: q?.limit ?? 100,
          skip: q?.skip ?? 0,
          search: q?.search,
          badge_num: q?.badge_num,
          status_isActive: q?.status_isActive,
        },
      }),

    createUser: (body: UserCreateBody) =>
      req<UserResponse>(token, '/users/', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    updateUser: (badgeNum: string, body: UserUpdateBody) =>
      req<UserResponse>(token, `/users/${encodeURIComponent(badgeNum)}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    deleteUser: (badgeNum: string) =>
      req<void>(token, `/users/${encodeURIComponent(badgeNum)}`, {
        method: 'DELETE',
      }),

    listEvidence: (caseId: number, q?: { limit?: number; skip?: number; search?: string }) =>
      req<EvidenceResponse[]>(token, `/evidence/case/${caseId}`, {
        method: 'GET',
        params: {
          limit: q?.limit ?? 100,
          skip: q?.skip ?? 0,
          search: q?.search,
        },
      }),

    uploadEvidence: (fd: FormData) =>
      req<EvidenceResponse>(token, '/evidence/', { method: 'POST', body: fd }),

    updateEvidence: (
      caseId: number,
      evidenceId: number,
      body: EvidenceUpdateBody
    ) =>
      req<EvidenceResponse>(token, `/evidence/${caseId}/${evidenceId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    deleteEvidence: (evidenceId: number) =>
      req<void>(token, `/evidence/${evidenceId}`, { method: 'DELETE' }),

    listCustody: (q?: {
      limit?: number
      skip?: number
      Evidence_id?: number
      ActingOfficerID?: number
    }) =>
      req<CustodyResponse[]>(token, '/custody/', {
        method: 'GET',
        params: {
          limit: q?.limit ?? 100,
          skip: q?.skip ?? 0,
          Evidence_id: q?.Evidence_id,
          ActingOfficerID: q?.ActingOfficerID,
        },
      }),

    getCustody: (recordId: number) =>
      req<CustodyResponse>(token, `/custody/${recordId}`, { method: 'GET' }),

    createCustody: (body: CustodyCreateBody) =>
      req<CustodyResponse>(token, '/custody/', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    updateCustody: (recordId: number, body: CustodyUpdateBody) =>
      req<CustodyResponse>(token, `/custody/${recordId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    deleteCustody: (recordId: number) =>
      req<void>(token, `/custody/${recordId}`, { method: 'DELETE' }),

    listAudit: (q?: {
      limit?: number
      skip?: number
      user_id?: number
      search?: string
      from_date?: string
      to_date?: string
    }) =>
      req<AuditResponse[]>(token, '/audit/', {
        method: 'GET',
        params: {
          limit: q?.limit ?? 50,
          skip: q?.skip ?? 0,
          user_id: q?.user_id,
          search: q?.search,
          from_date: q?.from_date,
          to_date: q?.to_date,
        },
      }),
  }
}

export async function downloadEvidenceFile(
  token: string,
  caseId: number,
  evidenceId: number,
  fallbackName: string
) {
  const res = await fetch(
    `/evidence/${caseId}/${evidenceId}/download`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(await parseApiError(res))
  const blob = await res.blob()
  const cd = res.headers.get('Content-Disposition')
  let name = fallbackName
  const m = cd?.match(/filename="?([^";]+)"?/)
  if (m) name = m[1]
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export type ApiClient = ReturnType<typeof createApi>
