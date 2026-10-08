import { type Location, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useCustomerAuthStore } from '@/store/auth-store'

export function RequireCustomerGuest() {
  const isAuthenticated = useCustomerAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (isAuthenticated) {
    const from = (location.state as { from?: Location } | null)?.from
    return <Navigate to={from?.pathname ?? '/account'} replace />
  }

  return <Outlet />
}
