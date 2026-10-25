"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Briefcase,
  Users,
  DollarSign,
  LogOut,
  Sparkles,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth-actions";
import type { UserSession } from "@/types/auth";

interface SidebarProps {
  user: UserSession;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Kalender Operasional",
      href: "/dashboard",
      icon: Calendar,
      roles: ["OWNER", "PLANNER", "CREW"],
    },
    {
      label: "Proyek Pernikahan",
      href: "/projects",
      icon: Briefcase,
      roles: ["OWNER", "PLANNER", "CREW"],
    },
    {
      label: "Direktori Rekanan",
      href: "/vendors",
      icon: Building2,
      roles: ["OWNER", "PLANNER"],
    },
    {
      label: "Skuad & Kru",
      href: "/projects",
      icon: Users,
      roles: ["OWNER", "PLANNER"],
    },
    {
      label: "Dapur Finansial",
      href: "/finances",
      icon: DollarSign,
      roles: ["OWNER"], // Tier 2: Eksklusif Dimas (Owner)
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  const roleLabelMap: Record<string, string> = {
    OWNER: "Owner",
    PLANNER: "Planner",
    CREW: "Kru Lapangan",
  };

  return (
    <aside className="hidden md:flex w-64 flex-col justify-between border-r border-border/70 bg-card text-card-foreground p-4 h-screen sticky top-0">
      <div className="flex flex-col gap-6">
        {/* Workspace Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 text-stone-50 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-sm tracking-tight text-foreground truncate">
              Altara Studio
            </span>
            <span className="text-xs text-muted-foreground truncate">
              Wedding Organizer OS
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-stone-900 text-stone-50 shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Pill & Sign Out */}
      <div className="flex flex-col gap-3 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-stone-800 text-xs font-semibold shrink-0">
              {user.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium text-foreground truncate">
                {user.fullName}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-mono px-1.5 py-0.5 border-border"
          >
            {roleLabelMap[user.role] ?? user.role}
          </Badge>
        </div>

        <form
          action={async () => {
            await logoutAction();
          }}
        >
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar Akun
          </Button>
        </form>
      </div>
    </aside>
  );
}
