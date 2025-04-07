"use client";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Users,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/types";
import { useUser } from "@/app/contexts/UserContext";
import { logout } from "@/actions/loginauth";

interface DashboardLayoutProps {
  children: ReactNode;
  role?: UserRole;
}

export default function DashboardLayout({
  children,
  role = "employee",
}: DashboardLayoutProps) {
  const { user, loading } = useUser();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  const userRole = user.employeeRoleType;
  console.log(userRole);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-fdm-blue text-white top-0 z-10">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <a
              id="site-logo"
              href="."
              title="fdm logo"
              className="items-center px-5 flex-none"
            >
              <Image src="/fdmlogo.png" alt="" width={150} height={0} />
            </a>
          </div>
          <div className="flex flex-row">
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="block opacity-75">Welcome,</span>
                <span className="font-medium">
                  {user.firstName} {user.familyName}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-black/20 hover:text-white ml-4 cursor-pointer hover:scale-[102%] transition-transform duration-200 ease-in-out"
              onClick={() => logout()}
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-grow flex">
        <aside className="w-64 bg-white shadow-2xl border-r border-gray-200 hidden md:block">
          <nav className="p-4 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
              Dashboard
            </p>
            <NavItem
              href="/dashboard"
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Overview"
            />

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2 px-3">
              Expense Claims
            </p>
            <NavItem
              href="/dashboard/claims/new"
              icon={<FileText className="h-4 w-4" />}
              label="New Claim"
            />
            <NavItem
              href="/dashboard/claims/drafts"
              icon={<Clock className="h-4 w-4" />}
              label="Draft Claims"
            />
            <NavItem
              href="/dashboard/claims/pending"
              icon={<Clock className="h-4 w-4" />}
              label="Pending Claims"
            />
            <NavItem
              href="/dashboard/claims/approved"
              icon={<CheckCircle className="h-4 w-4" />}
              label="Approved Claims"
            />
            <NavItem
              href="/dashboard/claims/rejected"
              icon={<XCircle className="h-4 w-4" />}
              label="Rejected Claims"
            />

            {userRole === "Line Manager" && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2 px-3">
                  Management
                </p>
                <NavItem
                  href="/dashboard/management/claims"
                  icon={<FileText className="h-4 w-4" />}
                  label="Review Claims"
                />
                <NavItem
                  href="/dashboard/management/employees"
                  icon={<Users className="h-4 w-4" />}
                  label="Employees"
                />
              </>
            )}

            {userRole === "payrollOfficer" && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2 px-3">
                  Payroll
                </p>
                <NavItem
                  href="/dashboard/payroll/claims"
                  icon={<CreditCard className="h-4 w-4" />}
                  label="Process Payments"
                />
              </>
            )}

            {userRole === "Administrator" && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2 px-3">
                  Administration
                </p>
                <NavItem
                  href="/dashboard/admin/manage-accounts"
                  icon={<Users className="h-4 w-4" />}
                  label="Manage Accounts"
                />
                <NavItem
                  href="/dashboard/admin/create-account"
                  icon={<Users className="h-4 w-4" />}
                  label="Create Account"
                />
              </>
            )}

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2 px-3">
              Account
            </p>
            <NavItem
              href="/dashboard/profile"
              icon={<User className="h-4 w-4" />}
              label="My Profile"
            />
            <NavItem
              href="/dashboard/settings"
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
            />
          </nav>
        </aside>

        <main className="flex-grow bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-fdm-green/10 text-fdm-green"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
