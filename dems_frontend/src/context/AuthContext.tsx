import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchMe, loginRequest } from '../api'
import type { MeUser } from '../types'

const TOKEN_KEY = 'dems_access_token'

type AuthState = {
  token: string | null
  user: MeUser | null
  loading: boolean
  error: string | null
  login: (badge: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  )
  const [user, setUser] = useState<MeUser | null>(null)
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY))
  const [error, setError] = useState<string | null>(null)

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null)
      return
    }
    const me = await fetchMe(token)
    setUser(me)
  }, [token])

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchMe(token)
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
          setToken(null)
          localStorage.removeItem(TOKEN_KEY)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const performLogin = useCallback(async (badge: string, password: string) => {
    setError(null)
    const data = await loginRequest(badge, password)
    localStorage.setItem(TOKEN_KEY, data.access_token)
    setToken(data.access_token)
    const me = await fetchMe(data.access_token)
    setUser(me)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setError(null)
  }, [])

  const login = useCallback(
    async (badge: string, password: string) => {
      try {
        await performLogin(badge, password)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Login failed'
        setError(msg)
        throw e
      }
    },
    [performLogin]
  )

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      error,
      login,
      logout,
      refreshUser,
    }),
    [token, user, loading, error, login, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
