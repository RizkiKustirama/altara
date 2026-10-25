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
  Wallet,
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
      roles: ["OWNER", "MANAGEMENT", "CREW"],
    },
    {
      label: "Proyek Pernikahan",
      href: "/projects",
      icon: Briefcase,
      roles: ["OWNER", "MANAGEMENT", "CREW"],
    },
    {
      label: "Direktori Rekanan",
      href: "/vendors",
      icon: Building2,
      roles: ["OWNER", "MANAGEMENT"],
    },
    {
      label: "Skuad & Kru",
      href: "/projects",
      icon: Users,
      roles: ["OWNER", "MANAGEMENT"],
    },
    {
      label: "Honor Kru Mingguan",
      href: "/payouts",
      icon: Wallet,
      roles: ["OWNER", "MANAGEMENT"], // Tier 2A: Maya & Dimas
    },
    {
      label: "Dapur Finansial",
      href: "/finances",
      icon: DollarSign,
      roles: ["OWNER"], // Tier 2B: Eksklusif Dimas (Owner)
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  const roleLabelMap: Record<string, string> = {
    OWNER: "Owner",
    MANAGEMENT: "Manajemen",
    CREW: "Staf Kru",
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
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session Footprint & Logout */}
      <div className="flex flex-col gap-3 pt-4 border-t border-border/70">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-foreground truncate">
              {user.fullName}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-mono tracking-wider"
          >
            {roleLabelMap[user.role] ?? user.role}
          </Badge>
        </div>

        <form action={async () => { await logoutAction(); }}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 font-normal"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar Akun</span>
          </Button>
        </form>
      </div>
    </aside>
  );
}
