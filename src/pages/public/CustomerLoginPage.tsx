import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { type SubmitEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { CustomerOtpForm } from '@/components/public/CustomerOtpForm'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginCustomer } from '@/api/customers'
import { getErrorMessage } from '@/lib/get-error-message'
import { useCustomerAuthStore } from '@/store/auth-store'

export function CustomerLoginPage() {
  const setAccessToken = useCustomerAuthStore((state) => state.setAccessToken)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)

  const loginMutation = useMutation({
    mutationFn: loginCustomer,
    onSuccess: (data) => setAccessToken(data.access_token),
    onError: (error) => {
      // Backend chỉ trả 403 khi mật khẩu đúng nhưng email chưa xác thực.
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setNeedsVerification(true)
      }
    },
  })

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          {needsVerification ? 'Xác thực email' : 'Đăng nhập'}
        </CardTitle>
        <CardDescription>
          {needsVerification
            ? 'Tài khoản chưa được xác thực. Nhập mã OTP đã nhận, hoặc gửi lại mã mới.'
            : 'Đăng nhập bằng email đã đăng ký'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {needsVerification ? (
          <CustomerOtpForm
            email={email}
            password={password}
            initialCooldown={0}
            onBack={() => {
              loginMutation.reset()
              setNeedsVerification(false)
            }}
          />
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {loginMutation.isError && (
              <p className="text-sm text-destructive">
                {getErrorMessage(loginMutation.error)}
              </p>
            )}
            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Link to="/account/register" className="font-medium text-primary">
                Đăng ký
              </Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Bạn là quản trị viên?{' '}
              <Link to="/login" className="font-medium text-primary">
                Đăng nhập trang quản trị
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
