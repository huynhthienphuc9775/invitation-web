export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

// Backend phân biệt hai loại tài khoản qua `role` trong payload JWT.
export type Role = 'admin' | 'customer'
