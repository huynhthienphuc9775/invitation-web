import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  CalendarDays,
  Contact,
  LayoutDashboard,
  Mail,
  Tags,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
  {
    to: "/admin/invitations",
    label: "Thiệp mời",
    icon: Mail,
    end: false,
  },
  { to: "/admin/categories", label: "Danh mục", icon: Tags, end: false },
  { to: "/admin/events", label: "Sự kiện", icon: CalendarDays, end: false },
  { to: "/admin/users", label: "Người dùng", icon: Users, end: false },
  { to: "/admin/customers", label: "Khách hàng", icon: Contact, end: false },
];

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-8 items-center px-2">
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
            Trang quản trị
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ to, label, icon: Icon, end }) => {
                const isActive = end
                  ? pathname === to
                  : pathname === to || pathname.startsWith(`${to}/`);

                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={label}
                      render={<NavLink to={to} />}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
