import { House, LogOut, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAuthStore, useCustomerAuthStore } from '@/store/auth-store'

export function Header() {
  const logout = useAuthStore((state) => state.logout)
  const isCustomer = useCustomerAuthStore((state) => state.isAuthenticated)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <span className="text-base font-medium">Trang quản trị</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" render={<Link to="/" />}>
          <House className="size-4" />
          Trang chủ
        </Button>
        {isCustomer && (
          <Button variant="ghost" size="sm" render={<Link to="/account" />}>
            <UserRound className="size-4" />
            Tài khoản khách hàng
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={logout}
        >
          <LogOut className="size-4" />
          Đăng xuất
        </Button>
      </div>
    </header>
  )
}
