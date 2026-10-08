import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getTokenRole } from '@/lib/jwt'
import type { Role } from '@/types/auth'

export interface AuthState {
  accessToken: string | null
  isAuthenticated: boolean
  setAccessToken: (accessToken: string) => void
  logout: () => void
}

// Admin và customer là hai phiên độc lập, mỗi bên một key localStorage.
function createAuthStore(name: string, role: Role) {
  return create<AuthState>()(
    persist(
      (set) => ({
        accessToken: null,
        isAuthenticated: false,
        setAccessToken: (accessToken) =>
          set({ accessToken, isAuthenticated: true }),
        logout: () => set({ accessToken: null, isAuthenticated: false }),
      }),
      {
        name,
        // Token sai role (hoặc token cũ từ trước khi backend có role) bị mọi
        // route trả 403, interceptor 401 không bắt được — bỏ ngay lúc nạp lại
        // để người dùng đăng nhập lại thay vì kẹt ở trang lỗi.
        merge: (persisted, current) => {
          const state = persisted as Partial<AuthState> | undefined
          if (!state?.accessToken || getTokenRole(state.accessToken) !== role) {
            return current
          }
          return { ...current, ...state }
        },
      },
    ),
  )
}

export const useAuthStore = createAuthStore('auth-storage', 'admin')
export const useCustomerAuthStore = createAuthStore(
  'customer-auth-storage',
  'customer',
)
