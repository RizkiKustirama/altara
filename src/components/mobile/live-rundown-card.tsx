"use client";

import React, { useState } from "react";
import type { ProjectRundown } from "@/db/schema/rundowns";
import { calculateDurationMinutes } from "@/lib/rundown-time";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Volume2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  User,
  Loader2,
} from "lucide-react";

interface LiveRundownCardProps {
  item: ProjectRundown;
  isUpNext?: boolean;
  canUpdateStatus: boolean;
  onStatusChange: (
    newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED"
  ) => Promise<void>;
}

export function LiveRundownCard({
  item,
  isUpNext,
  canUpdateStatus,
  onStatusChange,
}: LiveRundownCardProps) {
  const [showCues, setShowCues] = useState(false);
  const [loading, setLoading] = useState(false);

  const duration = calculateDurationMinutes(item.startTime, item.endTime);
  const hasCues = Boolean(item.musicCue || item.lightingCue);

  const handleAction = async (
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED"
  ) => {
    setLoading(true);
    try {
      await onStatusChange(status);
    } finally {
      setLoading(false);
    }
  };

  // Status Styling Variants
  let borderStyle = "border-l-stone-700 bg-stone-900/90";
  let statusBadge = (
    <span className="inline-flex items-center gap-1 rounded bg-stone-800 px-2 py-0.5 text-[10px] font-semibold text-stone-400">
      <Clock className="h-2.5 w-2.5" />
      <span>Menunggu</span>
    </span>
  );

  if (item.status === "IN_PROGRESS") {
    borderStyle =
      "border-l-amber-500 bg-stone-900 ring-1 ring-amber-500/40 shadow-xl shadow-amber-950/20";
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 animate-pulse">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span>SEDANG BERJALAN</span>
      </span>
    );
  } else if (item.status === "COMPLETED") {
    borderStyle =
      "border-l-emerald-500/60 bg-stone-900/50 opacity-75 border-border/40";
    statusBadge = (
      <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
        <CheckCircle2 className="h-2.5 w-2.5" />
        <span>Selesai</span>
      </span>
    );
  } else if (item.status === "DELAYED") {
    borderStyle =
      "border-l-rose-500 bg-stone-900 ring-1 ring-rose-500/30";
    statusBadge = (
      <span className="inline-flex items-center gap-1 rounded bg-rose-950/80 border border-rose-800/40 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
        <AlertTriangle className="h-2.5 w-2.5" />
        <span>Tertunda</span>
      </span>
    );
  } else if (isUpNext) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 rounded bg-blue-950/80 border border-blue-800/40 px-2 py-0.5 text-[10px] font-bold text-blue-300">
        <span>SESI BERIKUTNYA</span>
      </span>
    );
  }

  return (
    <article
      className={`relative flex flex-col rounded-2xl border-y border-r border-l-4 ${borderStyle} p-4 transition-all duration-150`}
    >
      {/* Top Header: Times & Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-extrabold tracking-tight text-stone-100">
            {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
          </span>
          <span className="rounded bg-stone-800/90 px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-400">
            {duration}m
          </span>
        </div>

        <div>{statusBadge}</div>
      </div>

      {/* Main Title & Notes */}
      <div className="mt-2.5">
        <h3 className="text-base font-bold text-stone-100 leading-snug">
          {item.title}
        </h3>
        {item.description && (
          <p className="mt-1 text-xs text-stone-300 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* PIC Role & Cue toggle button */}
      <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-stone-800/80">
        <div className="flex items-center gap-1.5 text-xs text-stone-300">
          <User className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-stone-200">
            {item.picRole || "Seluruh Tim WO"}
          </span>
        </div>

        {hasCues && (
          <button
            type="button"
            onClick={() => setShowCues(!showCues)}
            className="flex items-center gap-1 text-[11px] font-medium text-stone-400 hover:text-amber-300 transition-colors py-1 px-1.5 rounded active:bg-stone-800"
          >
            <span>Petunjuk A/V</span>
            {showCues ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* Expandable Music & Lighting Cues */}
      {showCues && hasCues && (
        <div className="mt-2.5 space-y-1.5 rounded-xl bg-stone-950/80 p-3 border border-stone-800 text-xs">
          {item.musicCue && (
            <div className="flex items-start gap-2">
              <Volume2 className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
              <span className="text-stone-300">
                <strong className="text-stone-400">Musik:</strong>{" "}
                {item.musicCue}
              </span>
            </div>
          )}
          {item.lightingCue && (
            <div className="flex items-start gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span className="text-stone-300">
                <strong className="text-stone-400">Pencahayaan:</strong>{" "}
                {item.lightingCue}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Field Actions: Large touch-target buttons (>= 44px) */}
      {canUpdateStatus && (
        <div className="mt-3 pt-2.5 border-t border-stone-800/60 flex items-center gap-2">
          {item.status === "PENDING" && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleAction("IN_PROGRESS")}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs active:scale-[0.98] transition-all shadow-md"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Mulai Sesi Ini</span>
                </>
              )}
            </button>
          )}

          {item.status === "IN_PROGRESS" && (
            <>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleAction("COMPLETED")}
                className="flex-[2] min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs active:scale-[0.98] transition-all shadow-md"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Tandai Selesai</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleAction("DELAYED")}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-400 font-semibold text-xs active:scale-[0.98] transition-all"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Tunda</span>
              </button>
            </>
          )}

          {(item.status === "COMPLETED" || item.status === "DELAYED") && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleAction("PENDING")}
              className="min-h-[44px] px-4 flex items-center justify-center gap-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-xs font-medium active:scale-[0.98] transition-all"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <RotateCcw className="h-3 w-3" />
                  <span>Buka Ulang</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
