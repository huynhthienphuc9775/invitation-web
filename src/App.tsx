import { Route, Routes } from 'react-router-dom'
import { RequireCustomer } from '@/components/public/RequireCustomer'
import { RequireCustomerGuest } from '@/components/public/RequireCustomerGuest'
import { RequireAuth } from '@/components/shared/RequireAuth'
import { RequireGuest } from '@/components/shared/RequireGuest'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { CategoriesPage } from '@/pages/admin/CategoriesPage'
import { CustomersPage } from '@/pages/admin/CustomersPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { EventsPage } from '@/pages/admin/EventsPage'
import { CustomerAccountPage } from '@/pages/public/CustomerAccountPage'
import { CustomerLoginPage } from '@/pages/public/CustomerLoginPage'
import { CustomerRegisterPage } from '@/pages/public/CustomerRegisterPage'
import { HomePage } from '@/pages/public/HomePage'
import { InvitationsPage } from '@/pages/admin/InvitationsPage'
import { UsersPage } from '@/pages/admin/UsersPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<RequireCustomerGuest />}>
        <Route element={<AuthLayout />}>
          <Route path="/account/login" element={<CustomerLoginPage />} />
          <Route path="/account/register" element={<CustomerRegisterPage />} />
        </Route>
      </Route>
      <Route element={<RequireCustomer />}>
        <Route path="/account" element={<CustomerAccountPage />} />
      </Route>
      <Route element={<RequireGuest />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="invitations" element={<InvitationsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="customers" element={<CustomersPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
