import type { Role } from '@/types/auth'

// Chỉ đọc payload để biết role, KHÔNG verify chữ ký — việc đó là của backend.
export function getTokenRole(token: string): Role | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { role } = JSON.parse(atob(payload)) as { role?: unknown }
    return role === 'admin' || role === 'customer' ? role : null
  } catch {
    return null
  }
}
