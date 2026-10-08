import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useCustomerAuthStore } from '@/store/auth-store'

export function RequireCustomer() {
  const isAuthenticated = useCustomerAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/account/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
