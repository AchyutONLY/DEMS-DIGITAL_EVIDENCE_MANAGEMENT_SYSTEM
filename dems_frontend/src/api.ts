import type { MeUser } from './types'

export async function loginRequest(
  badgeNumber: string,
  password: string
): Promise<{ access_token: string; token_type: string }> {
  const body = new URLSearchParams()
  body.set('username', badgeNumber)
  body.set('password', password)

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const detail =
      typeof err.detail === 'string'
        ? err.detail
        : Array.isArray(err.detail)
          ? err.detail.map((d: { msg?: string }) => d.msg).join(', ')
          : 'Login failed'
    throw new Error(detail)
  }

  return res.json()
}

export async function fetchMe(token: string): Promise<MeUser> {
  const res = await fetch('/me', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error('Session expired or invalid')
  }
  return res.json()
}
