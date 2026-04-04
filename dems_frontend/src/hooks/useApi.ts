import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { createApi, type ApiClient } from '../api/backend'

export function useApi(): ApiClient {
  const { token } = useAuth()
  if (!token) throw new Error('Not authenticated')
  return useMemo(() => createApi(token), [token])
}
