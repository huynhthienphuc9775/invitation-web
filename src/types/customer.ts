export interface Customer {
  id: number
  email: string
  emailVerified: boolean
  createdAt: string
}

export interface CustomerRegisterPayload {
  email: string
  password: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
  // Mật khẩu đã nhập lúc đăng ký/đăng nhập — backend bắt buộc để chống ghi đè tài khoản.
  password: string
}

export interface ResendOtpPayload {
  email: string
}

export interface OtpSentResponse {
  message: string
  email: string
}

export interface PaginatedCustomers {
  data: Customer[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetCustomersParams {
  // Tìm gần đúng theo email.
  search?: string
  emailVerified?: boolean
  page?: number
  limit?: number
}
