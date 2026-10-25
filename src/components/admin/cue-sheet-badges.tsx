"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Headphones, SunMedium, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export function MusicCueBadge({ cue }: { cue?: string | null }) {
  if (!cue) return null;
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-[11px] font-medium leading-none max-w-[200px] truncate">
      <Headphones className="h-3 w-3 shrink-0 text-indigo-500" />
      <span className="truncate" title={cue}>
        {cue}
      </span>
    </div>
  );
}

export function LightingCueBadge({ cue }: { cue?: string | null }) {
  if (!cue) return null;
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 text-[11px] font-medium leading-none max-w-[180px] truncate">
      <SunMedium className="h-3 w-3 shrink-0 text-amber-500" />
      <span className="truncate" title={cue}>
        {cue}
      </span>
    </div>
  );
}

export function PicRoleBadge({ role }: { role?: string | null }) {
  if (!role) return null;
  return (
    <Badge
      variant="outline"
      className="text-[11px] px-2 py-0.5 font-medium border-stone-200 bg-stone-50 text-stone-700 tracking-tight"
    >
      {role.replace(/_/g, " ")}
    </Badge>
  );
}

export function RundownStatusBadge({
  status,
}: {
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
}) {
  switch (status) {
    case "IN_PROGRESS":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600"></span>
          </span>
          Sedang Berjalan
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          Selesai
        </span>
      );
    case "DELAYED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-medium">
          <AlertCircle className="h-3 w-3 text-rose-600" />
          Terlambat
        </span>
      );
    case "PENDING":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200 text-[11px] font-medium">
          <Clock className="h-3 w-3 text-stone-400" />
          Menunggu
        </span>
      );
  }
}
