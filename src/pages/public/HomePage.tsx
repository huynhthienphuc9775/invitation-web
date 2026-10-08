import { Button } from "@/components/ui/button";
import { useCustomerAuthStore } from "@/store/auth-store";
import { Link } from "react-router-dom";

export function HomePage() {
  const isCustomer = useCustomerAuthStore((state) => state.isAuthenticated);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-semibold">Ecommerce</h1>
      <p className="max-w-md text-muted-foreground">
        Chào mừng bạn. Đây là trang chủ dành cho người dùng.
      </p>
      <div className="flex gap-2">
        {isCustomer ? (
          <Button render={<Link to="/account" />}>Tài khoản của tôi</Button>
        ) : (
          <>
            <Button render={<Link to="/account/login" />}>Đăng nhập</Button>
            <Button variant="outline" render={<Link to="/account/register" />}>
              Đăng ký
            </Button>
          </>
        )}
      </div>
      <Link
        to="/admin"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Trang quản trị
      </Link>
    </div>
  );
}
