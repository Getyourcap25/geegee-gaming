"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Calendar,
  Settings,
  LogOut,
  Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/app";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  profile: Profile;
}

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    adminOnly: false,
  },
  {
    href: "/aanvragen",
    label: "Aanvragen",
    icon: ClipboardList,
    adminOnly: false,
  },
  {
    href: "/nieuwe-aanvraag",
    label: "Nieuwe aanvraag",
    icon: PlusCircle,
    adminOnly: false,
  },
  {
    href: "/planning",
    label: "Planning",
    icon: Calendar,
    adminOnly: false,
  },
  {
    href: "/beheer",
    label: "Beheer",
    icon: Settings,
    adminOnly: true,
  },
];

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || profile.role === "admin"
  );

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
          <Gamepad2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-gray-900">
            GeeGee Gaming
          </p>
          <p className="mt-0.5 text-xs text-gray-500">× Incluzio</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-violet-50 text-violet-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info + logout */}
      <div className="border-t px-4 py-4">
        <div className="mb-3 px-2">
          <p className="truncate text-sm font-medium text-gray-900">
            {profile.full_name || profile.email}
          </p>
          <p className="text-xs text-gray-500">
            {profile.role === "admin" ? "Beheerder" : "Aanvrager"}
            {profile.organization ? ` · ${profile.organization}` : ""}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Uitloggen
        </button>
      </div>
    </aside>
  );
}
