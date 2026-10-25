"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Package,
  PhoneCall,
} from "lucide-react";

interface BottomTabBarProps {
  projectId: string;
  badgeCounts?: {
    runningSessions?: number;
    pendingLogistics?: number;
  };
}

export function BottomTabBar({
  projectId,
  badgeCounts,
}: BottomTabBarProps) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Ikhtisar",
      href: `/field/${projectId}`,
      exact: true,
      icon: LayoutDashboard,
    },
    {
      label: "Rundown",
      href: `/field/${projectId}/rundown`,
      icon: Clock,
      badge: badgeCounts?.runningSessions,
    },
    {
      label: "Logistik",
      href: `/field/${projectId}/logistics`,
      icon: Package,
      badge: badgeCounts?.pendingLogistics,
    },
    {
      label: "Kontak",
      href: `/field/${projectId}/contacts`,
      icon: PhoneCall,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Lapangan Mobile"
      className="fixed bottom-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-md border-t border-stone-800 pb-[env(safe-area-inset-bottom)] shadow-2xl transition-all"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center px-1">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? "text-amber-400 font-bold"
                  : "text-stone-400 hover:text-stone-200 font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? "scale-110 text-amber-400" : "text-stone-400"
                  }`}
                />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-stone-950 ring-2 ring-stone-950 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] tracking-tight mt-1 leading-none">
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-amber-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
