import { apiClient, customerApiClient } from '@/lib/api-client'
import type { LoginPayload, LoginResponse } from '@/types/auth'
import type {
  Customer,
  CustomerRegisterPayload,
  GetCustomersParams,
  OtpSentResponse,
  PaginatedCustomers,
  ResendOtpPayload,
  VerifyOtpPayload,
} from '@/types/customer'

export async function registerCustomer(payload: CustomerRegisterPayload) {
  const { data } = await customerApiClient.post<OtpSentResponse>(
    '/customers/register',
    payload,
  )
  return data
}

export async function verifyCustomerOtp(payload: VerifyOtpPayload) {
  const { data } = await customerApiClient.post<LoginResponse>(
    '/customers/verify-otp',
    payload,
  )
  return data
}

export async function resendCustomerOtp(payload: ResendOtpPayload) {
  const { data } = await customerApiClient.post<OtpSentResponse>(
    '/customers/resend-otp',
    payload,
  )
  return data
}

export async function loginCustomer(payload: LoginPayload) {
  const { data } = await customerApiClient.post<LoginResponse>(
    '/customers/login',
    payload,
  )
  return data
}

export async function getCurrentCustomer() {
  const { data } = await customerApiClient.get<Customer>('/customers/me')
  return data
}

// Endpoint chỉ dành cho admin — phải đi qua apiClient (token admin), không
// phải customerApiClient.
export async function getCustomers(params: GetCustomersParams = {}) {
  const { data } = await apiClient.get<PaginatedCustomers>('/customers', {
    params,
  })
  return data
}

export async function deleteCustomer(id: number) {
  await apiClient.delete(`/customers/${id}`)
}
