# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dự án

Admin dashboard quản lý **thiệp mời** (invitation): danh mục (category) → sự kiện (event) → thiệp mời (invitation). SPA thuần client, gọi REST API của một backend riêng (NestJS-style) qua `VITE_API_URL`.

Lưu ý: `HomePage` còn tiêu đề "Ecommerce" — di sản từ template, không phản ánh domain thật.

## Lệnh

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build (type-check là một phần của build)
npm run lint     # eslint .
npm run preview  # xem thử bản build
```

Chưa có test framework nào được cài. Cách kiểm chứng duy nhất hiện tại là `npm run build` (type-check) + `npm run lint`.

Cần `.env` với `VITE_API_URL` (xem `.env.example`).

## Stack

React 19 · Vite 8 · TypeScript · React Router 7 · TanStack Query 5 · Zustand 5 · Tailwind v4 · shadcn/ui trên nền **Base UI** (`@base-ui/react`), style `base-nova`.

Alias `@/*` → `src/*` (khai báo ở cả `vite.config.ts` và `tsconfig.app.json`).

## Kiến trúc

Phân tầng nghiêm ngặt, không có tầng hook trung gian:

```
src/types/*     interface thuần cho entity + Payload + Params
src/api/*       hàm gọi apiClient, nhận/trả type từ src/types — KHÔNG chứa React
src/pages/*     useQuery/useMutation gọi thẳng hàm trong src/api + toàn bộ UI & state
```

Mỗi trang là một file tự chứa: query, mutation, state của form/dialog, bảng, phân trang đều nằm chung. Không tách hook riêng, không tách component con — giữ đúng khuôn mẫu này khi thêm trang mới.

### Định tuyến (`src/App.tsx`)

- `/` — `HomePage`, công khai
- `RequireCustomerGuest` → `AuthLayout` → `/account/login`, `/account/register` (khách hàng)
- `RequireCustomer` → `/account` (trang tài khoản khách hàng)
- `RequireGuest` → `AuthLayout` → `/login`, `/register`
- `RequireAuth` → `/admin` + `AdminLayout` (sidebar + header), các trang con: index (dashboard), `invitations`, `categories`, `events`, `users`, `customers`

Guard đọc `isAuthenticated` từ Zustand. `RequireGuest` trả người dùng về `location.state.from` nếu có, mặc định `/admin`; `RequireCustomerGuest` tương tự, mặc định `/account`.

### Hai luồng: admin và public

Dự án có hai luồng người dùng tách biệt, và **cấu trúc thư mục phản ánh điều đó** — nhìn đường dẫn là biết ngay file thuộc luồng nào:

```
src/components/
  ui/       shadcn sinh ra — dùng chung, không sửa tay
  shared/   dùng ở CẢ HAI luồng (RequireAuth, RequireGuest)
  admin/    chỉ luồng admin (AppSidebar, Header)
  public/   chỉ luồng công khai (RequireCustomer, RequireCustomerGuest, CustomerOtpForm)
src/pages/
  admin/    Dashboard, Categories, Events, Invitations, Users, Customers
  public/   HomePage, CustomerLogin/Register/AccountPage
  auth/     Login, Register
src/layouts/
  AdminLayout.tsx   sidebar + header, dùng cho /admin
  AuthLayout.tsx    khung căn giữa cho login/register
```

Quy tắc đặt file mới: mặc định đặt vào thư mục của luồng đang dùng nó. **Chỉ chuyển lên `shared/` khi thực sự có luồng thứ hai dùng đến** — không đoán trước, tránh `shared/` phình thành thùng rác.

`auth/` để riêng, không gộp vào `admin/`: login/register là màn hình công khai (chưa đăng nhập), dù đăng nhập xong thì vào `/admin`.

Khi luồng public phát triển nhiều trang và cần khung riêng, thêm `src/layouts/PublicLayout.tsx` thay vì nhét vào `AdminLayout`.

### Auth

Backend có **hai loại tài khoản độc lập**, phân biệt bằng `role` trong payload JWT (`'admin' | 'customer'`): admin (`User`) và khách hàng (`Customer`). Route admin chỉ nhận token `role: 'admin'` (token khác → 403), socket thống kê cũng vậy.

`src/store/auth-store.ts` — `createAuthStore(name, role)` sinh hai store Zustand + `persist` tách biệt: `useAuthStore` (admin, key `auth-storage`) và `useCustomerAuthStore` (key `customer-auth-storage`). Hai phiên có thể cùng tồn tại. Mỗi store chỉ giữ `accessToken` + `isAuthenticated`; **không có refresh token**, hết hạn là đăng xuất. Option `merge` bỏ token có `role` không khớp (kể cả token cũ chưa có `role`) ngay lúc nạp lại — vì backend trả 403 chứ không phải 401, interceptor không tự gỡ được. `src/lib/jwt.ts` chỉ decode payload, không verify.

`src/lib/api-client.ts` — `createApiClient(store)` sinh `apiClient` (admin) và `customerApiClient` (chỉ dùng trong `src/api/customers.ts`). Lưu ý `src/api/customers.ts` dùng **cả hai**: các hàm của khách hàng đi qua `customerApiClient`, còn `getCustomers`/`deleteCustomer` (dành cho admin) phải đi qua `apiClient`. Mỗi client cài hai interceptor gắn với đúng store của nó:
- request: gắn `Authorization: Bearer <accessToken>`
- response: 401 **chỉ khi đang đăng nhập** → `logout()` + toast "hết hạn phiên". 401 lúc login được thả xuống cho trang login tự hiển thị.

Luồng khách hàng (email bất kỳ, mật khẩu 8–72 ký tự):
1. `POST /customers/register` → gửi OTP 6 số qua mail → trang chuyển sang `CustomerOtpForm`.
2. `POST /customers/verify-otp { email, otp, password }` → trả token. Backend **bắt buộc gửi lại mật khẩu**, nên mật khẩu chỉ giữ trong state của trang, không lưu đâu khác.
3. `POST /customers/login` trả **403** khi mật khẩu đúng nhưng email chưa xác thực → `CustomerLoginPage` chuyển sang `CustomerOtpForm` với email/mật khẩu vừa nhập.
4. `POST /customers/resend-otp` có cooldown 60s (backend trả 429); form đếm ngược ở client để khớp.
5. Admin xóa khách (`DELETE /customers/:id`, xóa hẳn) thì token của khách vẫn hợp lệ tới khi hết hạn và `/customers/me` trả **404** — `CustomerAccountPage` tự đăng xuất khi gặp 404.

Endpoint lệch quy ước cần nhớ: đăng ký là `POST /user` (không phải `/auth/register`), danh sách user là `GET /user` (số ít).

### Xử lý lỗi — hai lớp

1. **Toàn cục**: `QueryCache`/`MutationCache` trong `src/main.tsx` bắt mọi lỗi → `toast.error(getErrorMessage(error))`, bỏ qua lỗi 401 (interceptor đã báo rồi).
2. **Tại chỗ**: trang vẫn tự render `getErrorMessage(mutation.error)` trong dialog/bảng để người dùng thấy lỗi ngay cạnh thao tác.

Cả hai cùng chạy — đây là chủ ý, không phải trùng lặp. `getErrorMessage` gom `response.data.message` kể cả khi backend trả mảng (lỗi validation NestJS).

### Toast

`src/lib/toast.ts` tạo `toastManager` **bên ngoài React** để axios interceptor cũng bắn được toast. Luôn dùng `toast.success/error/warning/info`, không gọi `toastManager.add` trực tiếp. `error`/`warning` tự đặt `priority: 'high'` và timeout dài hơn.

### Query key & invalidation

Key đang dùng: `['categories']`, `['events', {filters}]`, `['event-options']`, `['invitations', {filters}]`, `['invitations', 'stats-by-event']`, `['users']`, `['customers', {filters}]`, `['customer-me']` (xóa khi khách đăng xuất).

Thống kê ở Dashboard cố ý nằm dưới tiền tố `invitations` để mọi chỗ invalidate `['invitations']` làm mới luôn biểu đồ. Key này **không có filter**: luôn lấy toàn bộ rồi lọc `categoryId` ở client, vì socket chỉ đẩy dữ liệu chưa lọc (xem Realtime).

`event-options` tách riêng khỏi `events` vì backend chưa có endpoint "lấy tất cả sự kiện" — `getEventOptions()` gọi `getEvents({page:1, limit:1000})` để đổ dropdown.

Quan hệ invalidation phải giữ khi sửa mutation:
- **category**: create/delete chỉ invalidate `categories`; update invalidate thêm `events` (event nhúng object `category`)
- thêm/sửa/xóa **event** → invalidate `events` + `event-options`; riêng update còn phải invalidate `invitations` (invitation nhúng object `event`)
- mutation **invitation** → invalidate `invitations`

### Realtime (Socket.IO)

`src/lib/socket.ts` — `createSocket()` kết nối tới `VITE_API_URL` (phải là origin thuần, path sẽ bị hiểu là namespace), gửi JWT qua `auth: { token }` dạng hàm để mỗi lần reconnect đọc token mới. Thiếu/sai token thì server từ chối ngay lúc handshake.

Hiện chỉ `DashboardPage` dùng: mở socket trong `useEffect` khi vào trang, `disconnect` khi rời. Nhận `INVITATION_STATS_EVENT` (`invitation:stats-by-event`) → `setQueryData` ghi đè cache thống kê, không fetch lại; `reconnect` → invalidate một lần để bù message bị lỡ. Server bắn khi invitation/event thay đổi, kể cả do admin khác.

### Upload ảnh

`events` và `invitations` gửi **`FormData`**, không phải JSON — để axios tự set `Content-Type`, đừng gắn tay. Ở `update*`, field nào `undefined` thì không `append` (PATCH một phần). Khi sửa mà không đổi ảnh, để trống input file.

## Quy ước

- **Toàn bộ chuỗi hiển thị cho người dùng viết bằng tiếng Việt.** Comment trong code cũng tiếng Việt, và chỉ viết khi giải thích *tại sao*.
- Component export dạng **named export** (`export function EventsPage()`), không default export — trừ `App.tsx`.
- Base UI khác Radix ở vài chỗ: `SelectValue` nhận **render function** `{(value: string) => ...}` chứ không phải `placeholder`; `onValueChange` trả `unknown` nên phải ép `value as string`. Xem `EventsPage` làm mẫu.
- Value của `Select` luôn là string — ID số phải `String(id)` khi set và `Number(value)` khi dùng.
- Bộ lọc dạng "tất cả" dùng sentinel string (`'all'`) rồi map sang `undefined` khi gọi API; đổi filter phải `setPage(1)`.
- Ô tìm kiếm debounce 400ms bằng `useEffect` + `setTimeout` (xem `EventsPage`).
- Xóa dùng `AlertDialog` + một `isDeletingRef` chặn double-submit.
- Mở form là gọi `mutation.reset()` trước để xóa lỗi của lần trước.
- ESLint bật `unused-imports/no-unused-imports` ở mức **error** — import thừa làm fail lint.
- `noUnusedLocals`/`noUnusedParameters` bật trong tsconfig; tiền tố `_` để bỏ qua.
- Chưa có Prettier/Biome. Style chủ đạo là **single quote, không semicolon**; vài file cũ (`LoginPage`, `HomePage`) còn double quote + semicolon. Viết theo style của file đang sửa.

## Components UI

`src/components/ui/*` là code shadcn sinh ra — thêm component mới bằng shadcn CLI (`components.json` đã cấu hình sẵn) thay vì viết tay. Theme và CSS variable nằm trong `src/index.css` (Tailwind v4 `@theme inline`, không có `tailwind.config.js`).
