import { House, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAuthStore } from '@/store/auth-store'

export function Header() {
  const logout = useAuthStore((state) => state.logout)

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
