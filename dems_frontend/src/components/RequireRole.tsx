import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

export function RequireRole({
  roles,
  children,
}: {
  roles: Role[]
  children: ReactNode
}) {
  const { user } = useAuth()
  if (!user) return null
  const ok = roles.includes(user.Role as Role)
  if (!ok) return <Navigate to="/" replace />
  return <>{children}</>
}
