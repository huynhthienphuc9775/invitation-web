import { useMutation } from '@tanstack/react-query'
import { type SubmitEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resendCustomerOtp, verifyCustomerOtp } from '@/api/customers'
import { getErrorMessage } from '@/lib/get-error-message'
import { toast } from '@/lib/toast'
import { useCustomerAuthStore } from '@/store/auth-store'

// Khớp OTP_RESEND_COOLDOWN_SECONDS ở backend; backend vẫn là nơi chặn thật (429).
export const OTP_RESEND_COOLDOWN_SECONDS = 60

interface CustomerOtpFormProps {
  email: string
  password: string
  // Vừa gửi OTP xong thì truyền OTP_RESEND_COOLDOWN_SECONDS; không rõ lần gửi trước thì 0.
  initialCooldown: number
  onBack: () => void
}

// Dùng chung cho đăng ký và đăng nhập (tài khoản chưa xác thực).
// Xác thực xong chỉ cần lưu token — RequireCustomerGuest tự chuyển trang.
export function CustomerOtpForm({
  email,
  password,
  initialCooldown,
  onBack,
}: CustomerOtpFormProps) {
  const setAccessToken = useCustomerAuthStore((state) => state.setAccessToken)

  const [otp, setOtp] = useState('')
  const [cooldown, setCooldown] = useState(initialCooldown)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const verifyMutation = useMutation({
    mutationFn: verifyCustomerOtp,
    onSuccess: (data) => {
      toast.success('Xác thực email thành công')
      setAccessToken(data.access_token)
    },
  })

  const resendMutation = useMutation({
    mutationFn: resendCustomerOtp,
    onSuccess: () => {
      verifyMutation.reset()
      setOtp('')
      setCooldown(OTP_RESEND_COOLDOWN_SECONDS)
      toast.success('Đã gửi lại mã OTP', `Kiểm tra hộp thư ${email}.`)
    },
  })

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    verifyMutation.mutate({ email, otp, password })
  }

  const error = verifyMutation.error ?? resendMutation.error

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <p className="text-sm text-muted-foreground">
        Mã OTP gồm 6 chữ số đã được gửi tới{' '}
        <span className="font-medium text-foreground">{email}</span>, có hiệu
        lực trong 5 phút.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="otp">Mã OTP</Label>
        <Input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={6}
          pattern="\d{6}"
          title="Mã OTP gồm 6 chữ số"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          autoFocus
          required
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
      )}
      <Button
        type="submit"
        className="mt-2 w-full"
        disabled={verifyMutation.isPending}
      >
        {verifyMutation.isPending ? 'Đang xác thực...' : 'Xác thực'}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <Button type="button" variant="link" className="px-0" onClick={onBack}>
          Đổi email
        </Button>
        <Button
          type="button"
          variant="link"
          className="px-0"
          disabled={cooldown > 0 || resendMutation.isPending}
          onClick={() => resendMutation.mutate({ email })}
        >
          {cooldown > 0 ? `Gửi lại mã sau ${cooldown}s` : 'Gửi lại mã'}
        </Button>
      </div>
    </form>
  )
}
