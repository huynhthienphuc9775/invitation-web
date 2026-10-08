import { useMutation } from '@tanstack/react-query'
import { type SubmitEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CustomerOtpForm,
  OTP_RESEND_COOLDOWN_SECONDS,
} from '@/components/public/CustomerOtpForm'
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
import { registerCustomer } from '@/api/customers'
import { getErrorMessage } from '@/lib/get-error-message'

export function CustomerRegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Email đã chuẩn hoá do backend trả về; có giá trị nghĩa là đang ở bước nhập OTP.
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const registerMutation = useMutation({
    mutationFn: registerCustomer,
    onSuccess: (data) => setPendingEmail(data.email),
  })

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    registerMutation.mutate({ email, password })
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          {pendingEmail ? 'Xác thực email' : 'Đăng ký tài khoản'}
        </CardTitle>
        <CardDescription>
          {pendingEmail
            ? 'Nhập mã OTP để kích hoạt tài khoản'
            : 'Đăng ký bằng địa chỉ email của bạn'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingEmail ? (
          <CustomerOtpForm
            email={pendingEmail}
            password={password}
            initialCooldown={OTP_RESEND_COOLDOWN_SECONDS}
            onBack={() => {
              registerMutation.reset()
              setPendingEmail(null)
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
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Tối thiểu 8 ký tự.</p>
            </div>
            {registerMutation.isError && (
              <p className="text-sm text-destructive">
                {getErrorMessage(registerMutation.error)}
              </p>
            )}
            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Đang gửi mã...' : 'Đăng ký'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link to="/account/login" className="font-medium text-primary">
                Đăng nhập
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
