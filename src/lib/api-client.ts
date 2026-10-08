import axios from 'axios'
import { toast } from '@/lib/toast'
import {
  type AuthState,
  useAuthStore,
  useCustomerAuthStore,
} from '@/store/auth-store'

export function isUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}

// Mỗi phiên một client riêng để token customer không bao giờ bị gắn vào
// request admin (và ngược lại), và 401 chỉ đăng xuất đúng phiên đó.
function createApiClient(store: { getState: () => AuthState }) {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  })

  client.interceptors.request.use((config) => {
    const { accessToken } = store.getState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Chỉ coi là hết hạn phiên khi đang đăng nhập; 401 lúc đăng nhập sai mật
      // khẩu để màn hình login tự hiển thị lỗi.
      if (isUnauthorizedError(error) && store.getState().isAuthenticated) {
        store.getState().logout()
        toast.warning(
          'Phiên đăng nhập đã hết hạn',
          'Vui lòng đăng nhập lại để tiếp tục.',
        )
      }
      return Promise.reject(error)
    },
  )

  return client
}

export const apiClient = createApiClient(useAuthStore)
export const customerApiClient = createApiClient(useCustomerAuthStore)
