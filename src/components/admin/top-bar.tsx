"use client";

import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserSession } from "@/types/auth";

interface TopBarProps {
  user: UserSession;
}

export function TopBar({ user }: TopBarProps) {
  // Indonesian formatted date
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  const canCreate = user.role === "OWNER" || user.role === "PLANNER";

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/70 bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {canCreate && (
          <Link href="/projects/new">
            <Button size="sm" className="h-8 gap-1.5 text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Proyek Baru</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
