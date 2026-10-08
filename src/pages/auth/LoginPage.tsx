import { login } from "@/api/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/get-error-message";
import { useAuthStore } from "@/store/auth-store";
import { useMutation } from "@tanstack/react-query";
import { type SubmitEvent, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function LoginPage() {
  const location = useLocation();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAccessToken(data.access_token);
    },
  });

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  }

  const justRegistered = Boolean(
    (location.state as { registered?: boolean } | null)?.registered,
  );

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>
          Nhập email và mật khẩu để truy cập hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {justRegistered && (
            <p className="text-sm text-green-600">
              Đăng ký thành công, vui lòng đăng nhập.
            </p>
          )}
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
            {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Di chuyển vào trang chủ?{" "}
            <Link to="/" className="font-medium text-primary">
              Trang chủ
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Bạn là khách hàng?{" "}
            <Link to="/account/login" className="font-medium text-primary">
              Đăng nhập tài khoản khách hàng
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
