"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  CircleUserRound,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorUp,
  Settings,
  ShoppingBag,
  Tags,
  TicketPercent,
  Users,
  X
} from "lucide-react";
import { Logo } from "@/components/store/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  [LayoutDashboard, "Dashboard", "/admin"],
  [BookOpen, "Books", "/admin/books"],
  [FolderOpen, "Categories", "/admin/categories"],
  [CircleUserRound, "Writers", "/admin/writers"],
  [ShoppingBag, "Orders", "/admin/orders"],
  [TicketPercent, "Coupons", "/admin/coupons"],
  [MonitorUp, "Hero banners", "/admin/banners"],
  [Users, "Users", "/admin/users"],
  [BarChart3, "Analytics", "/admin/analytics"],
  [Settings, "Settings", "/admin/settings"],
  [Tags, "Profile", "/admin/profile"]
] as const;

export function AdminShell({
  children,
  user
}: {
  children: React.ReactNode;
  user: { displayName: string; email: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().auth.signOut();
    }
    router.push("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <>
      <div className="flex h-20 items-center justify-between border-b px-5">
        <Logo />
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="size-5" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {links.map(([Icon, label, href]) => {
          const active =
            href === "/admin"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground",
                active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <Icon className="size-4.5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="mb-3 min-w-0 px-2">
          <p className="truncate text-sm font-semibold">{user.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={logout}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/45">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-background lg:flex">
        {sidebar}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/30"
            onClick={() => setMobileOpen(false)}
            aria-label="Close admin navigation"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-background shadow-lift">
            {sidebar}
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <Link
            href="/"
            className="ml-auto flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" /> View store
          </Link>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
