"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Car, BookOpen, Users, Settings, LogOut,
  DollarSign, MessageSquare, ShieldAlert, UserCog, Megaphone, UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { SITE_NAME } from "@/lib/constants";

const opsItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/rides", icon: Car, label: "Rides" },
  { href: "/admin/bookings", icon: BookOpen, label: "Bookings" },
  { href: "/admin/drivers", icon: Users, label: "Drivers" },
  { href: "/admin/customers", icon: UserCog, label: "Customers" },
];

const systemItems = [
  { href: "/admin/finance", icon: DollarSign, label: "Finance" },
  { href: "/admin/comms", icon: MessageSquare, label: "Communications" },
  { href: "/admin/safety", icon: ShieldAlert, label: "Safety" },
  { href: "/admin/team", icon: Megaphone, label: "Team / Admins" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/");
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden md:flex h-full w-64 flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="12th Van"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="font-bold">{SITE_NAME}</span>
          </Link>
          <span className="ml-auto rounded-md bg-maroon/10 px-2 py-0.5 text-xs font-semibold text-maroon">
            Admin
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Operations
          </p>
          {opsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all mb-0.5",
                isActive(item.href)
                  ? "bg-maroon text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}

          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            System
          </p>
          {systemItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all mb-0.5",
                isActive(item.href)
                  ? "bg-maroon text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section at bottom with My Account link */}
        <div className="border-t border-border p-3">
          {user && (
            <Link
              href="/account"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 mb-1 hover:bg-muted transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon/10 overflow-hidden flex-shrink-0">
                {user.photo_url ? (
                  <img src={user.photo_url} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <UserCircle className="h-5 w-5 text-maroon" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden border-t border-border bg-card">
        {[opsItems[0], opsItems[1], opsItems[2], opsItems[3]].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
              isActive(item.href) ? "text-maroon" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
        <Link
          href="/account"
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
            "text-muted-foreground"
          )}
        >
          <UserCircle className="h-5 w-5" />
          Account
        </Link>
      </nav>
    </>
  );
}
