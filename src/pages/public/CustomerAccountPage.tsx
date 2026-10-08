import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { House, LayoutDashboard, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getCurrentCustomer } from '@/api/customers'
import { getErrorMessage } from '@/lib/get-error-message'
import { useAuthStore, useCustomerAuthStore } from '@/store/auth-store'

function isNotFoundError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404
}

export function CustomerAccountPage() {
  const queryClient = useQueryClient()
  const logout = useCustomerAuthStore((state) => state.logout)
  const isAdmin = useAuthStore((state) => state.isAuthenticated)

  const customerQuery = useQuery({
    queryKey: ['customer-me'],
    queryFn: getCurrentCustomer,
    // 404 là trạng thái cố định (tài khoản đã bị xóa), thử lại vô ích.
    retry: (failureCount, error) =>
      !isNotFoundError(error) && failureCount < 3,
  })

  function handleLogout() {
    // Xoá cache để khách đăng nhập sau không thấy thoáng dữ liệu người trước.
    queryClient.removeQueries({ queryKey: ['customer-me'] })
    logout()
  }

  // Admin xóa tài khoản thì token cũ vẫn hợp lệ tới khi hết hạn, backend trả
  // 404 thay vì 401 nên interceptor không tự đăng xuất — phải tự làm ở đây.
  useEffect(() => {
    if (!isNotFoundError(customerQuery.error)) return
    queryClient.removeQueries({ queryKey: ['customer-me'] })
    logout()
  }, [customerQuery.error, queryClient, logout])

  const customer = customerQuery.data

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Tài khoản của tôi</CardTitle>
          <CardDescription>Thông tin tài khoản khách hàng</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {customerQuery.isPending ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : customerQuery.isError ? (
            <p className="text-sm text-destructive">
              {getErrorMessage(customerQuery.error)}
            </p>
          ) : (
            customer && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium break-all">{customer.email}</dd>
                <dt className="text-muted-foreground">Trạng thái</dt>
                <dd>
                  <Badge variant={customer.emailVerified ? 'default' : 'secondary'}>
                    {customer.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </Badge>
                </dd>
                <dt className="text-muted-foreground">Ngày tạo</dt>
                <dd>{new Date(customer.createdAt).toLocaleString('vi-VN')}</dd>
              </dl>
            )
          )}
          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" render={<Link to="/" />}>
                <House className="size-4" />
                Trang chủ
              </Button>
              {isAdmin && (
                <Button variant="ghost" size="sm" render={<Link to="/admin" />}>
                  <LayoutDashboard className="size-4" />
                  Trang quản trị
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Đăng xuất
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
