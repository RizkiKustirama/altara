"use client";

import { useState } from "react";
import Link from "next/link";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  ExternalLink,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveTimeMarker } from "@/components/admin/live-time-marker";
import type { ProjectItemDTO } from "@/actions/project-actions";

interface CalendarGridProps {
  projects: ProjectItemDTO[];
}

export function CalendarGrid({ projects }: CalendarGridProps) {
  // Focus on current week (starting Monday or customized to Friday-Sunday focus)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    return startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  });

  const prevWeek = () => setCurrentWeekStart((prev) => addDays(prev, -7));
  const nextWeek = () => setCurrentWeekStart((prev) => addDays(prev, 7));
  const todayWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Operational days: Friday (index 4), Saturday (index 5), Sunday (index 6)
  const days = [
    addDays(currentWeekStart, 4), // Friday
    addDays(currentWeekStart, 5), // Saturday
    addDays(currentWeekStart, 6), // Sunday
  ];

  const operationalHours = [
    "06:00",
    "08:00",
    "10:00",
    "12:00",
    "14:00",
    "16:00",
    "18:00",
    "20:00",
    "22:00",
  ];

  const statusVariantMap: Record<string, string> = {
    PLANNING: "bg-amber-100 text-amber-800 border-amber-200",
    READY: "bg-blue-100 text-blue-800 border-blue-200",
    IN_PROGRESS: "bg-emerald-100 text-emerald-800 border-emerald-200",
    COMPLETED: "bg-stone-100 text-stone-700 border-stone-200",
    LEAD: "bg-purple-100 text-purple-800 border-purple-200",
    CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
  };

  const statusLabelMap: Record<string, string> = {
    PLANNING: "Planning",
    READY: "Siap Hari-H",
    IN_PROGRESS: "Berlangsung",
    COMPLETED: "Selesai",
    LEAD: "Prospek",
    CANCELLED: "Dibatalkan",
  };

  const isCurrentWeekendInView = days.some((day) => isSameDay(day, new Date()));

  return (
    <div className="flex flex-col gap-4">
      {/* Calendar Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/70 shadow-xs">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Linimasa Operasional Pernikahan Akhir Pekan
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={todayWeek}
            className="text-xs h-8 border-border/80"
          >
            Pekan Ini
          </Button>
          <div className="flex items-center border border-border/80 rounded-lg overflow-hidden bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevWeek}
              className="h-8 w-8 rounded-none hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextWeek}
              className="h-8 w-8 rounded-none hover:bg-muted border-l border-border/60"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
        {/* Days Header */}
        <div className="grid grid-cols-[80px_repeat(3,1fr)] border-b border-border/70 bg-stone-100/70 text-xs font-semibold text-stone-700">
          <div className="p-3 text-center text-muted-foreground border-r border-border/60 font-mono">
            WAKTU
          </div>
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`p-3 text-center border-r border-border/60 last:border-r-0 ${
                  isToday ? "bg-stone-900 text-stone-50 font-bold" : ""
                }`}
              >
                <div className="text-[11px] uppercase tracking-wider">
                  {format(day, "EEEE", { locale: localeId })}
                </div>
                <div className="text-sm font-semibold">
                  {format(day, "d MMMM yyyy", { locale: localeId })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timetable Body */}
        <div className="relative grid grid-cols-[80px_repeat(3,1fr)] min-h-[540px]">
          {/* Live Time Marker (only rendered when this weekend includes today) */}
          {isCurrentWeekendInView && <LiveTimeMarker startHour={6} endHour={23} />}

          {/* Time Labels Column */}
          <div className="flex flex-col border-r border-border/60 bg-muted/20">
            {operationalHours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-border/40 text-[11px] font-mono text-muted-foreground flex items-start justify-center pt-2"
              >
                {hour}
              </div>
            ))}
          </div>

          {/* 3 Columns for Friday, Saturday, Sunday */}
          {days.map((day) => {
            const dayIsoStr = format(day, "yyyy-MM-dd");
            const dayProjects = projects.filter(
              (p) => p.weddingDate === dayIsoStr
            );

            return (
              <div
                key={day.toISOString()}
                className="relative flex flex-col p-2 gap-3 border-r border-border/60 last:border-r-0 bg-background/50 hover:bg-stone-50/40 transition-colors min-h-full"
              >
                {/* Background hour grid lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col">
                  {operationalHours.map((hour) => (
                    <div
                      key={hour}
                      className="h-16 border-b border-border/30 w-full"
                    />
                  ))}
                </div>

                {/* Event Cards */}
                {dayProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-muted-foreground/60">
                    <span className="text-xs italic">
                      Tidak ada jadwal acara
                    </span>
                  </div>
                ) : (
                  dayProjects.map((project) => (
                    <div
                      key={project.id}
                      className="relative z-10 flex flex-col gap-2 rounded-lg border border-border/80 bg-card p-3.5 shadow-xs hover:shadow-md transition-all border-l-4 border-l-stone-900"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                          {project.projectName}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 font-medium shrink-0 ${
                            statusVariantMap[project.status] ?? ""
                          }`}
                        >
                          {statusLabelMap[project.status] ?? project.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-stone-500" />
                        <span className="truncate">{project.venueName}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-stone-700">
                          <Users className="h-3.5 w-3.5 text-stone-500" />
                          <span>{project.crewCount} Kru Bertugas</span>
                        </div>

                        <Link
                          href={`/projects/${project.id}/squad`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        >
                          <span>Kelola Skuad</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
