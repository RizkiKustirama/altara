import React from "react";
import { CheckCircle2, Sparkles, UserCheck } from "lucide-react";

interface PreparationProgressCardProps {
  progress: {
    totalMilestones: number;
    completedMilestones: number;
    percentage: number;
  };
  leadPlannerName: string;
}

export function PreparationProgressCard({
  progress,
  leadPlannerName,
}: PreparationProgressCardProps) {
  const { percentage, completedMilestones, totalMilestones } = progress;

  let progressMessage = "Persiapan awal & penyusunan konsep acara";
  if (percentage >= 100) {
    progressMessage = "Sempurna! Seluruh vendor dan susunan acara siap dijalankan";
  } else if (percentage >= 75) {
    progressMessage = "Fase akhir: Seluruh rekanan utama terkonfirmasi & rundown terkunci";
  } else if (percentage >= 50) {
    progressMessage = "Progres matang: Separuh tahapan utama telah selesai";
  }

  return (
    <div className="rounded-3xl bg-white/95 border border-stone-200/90 p-5 shadow-xs backdrop-blur-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/60 text-amber-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 font-serif">
              Status Kesiapan Acara
            </h3>
            <p className="text-[11px] text-stone-500">
              {completedMilestones} dari {totalMilestones} tahapan krusial terkonfirmasi
            </p>
          </div>
        </div>

        <span className="font-serif text-2xl font-bold text-amber-800">
          {percentage}%
        </span>
      </div>

      {/* Dynamic Progress Bar */}
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-500 shadow-xs"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-stone-600 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>{progressMessage}</span>
        </p>
      </div>

      {/* Lead Planner Signature */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-1.5">
          <UserCheck className="h-3.5 w-3.5 text-amber-700" />
          <span>Wedding Planner:</span>
          <strong className="text-stone-800 font-semibold">{leadPlannerName}</strong>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700">
          Altara Verified
        </span>
      </div>
    </div>
  );
}
