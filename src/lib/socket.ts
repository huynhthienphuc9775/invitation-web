import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/auth-store'

// Socket.IO coi path trong URL là namespace, nên VITE_API_URL phải là origin thuần.
export function createSocket() {
  return io(import.meta.env.VITE_API_URL, {
    // Dạng hàm để mỗi lần reconnect đọc lại token mới nhất từ store.
    auth: (cb) => cb({ token: useAuthStore.getState().accessToken }),
  })
}
