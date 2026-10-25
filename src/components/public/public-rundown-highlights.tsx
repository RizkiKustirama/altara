import React from "react";
import type { PublicRundownHighlightDTO } from "@/types/public-portal-dto";
import { Clock, CalendarCheck } from "lucide-react";

interface PublicRundownHighlightsProps {
  highlights: PublicRundownHighlightDTO[];
}

export function PublicRundownHighlights({
  highlights,
}: PublicRundownHighlightsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-amber-700" />
          <span>Rangkaian Acara Hari Bahagia ({highlights.length})</span>
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Jadwal utama prosesi hari-H yang telah disepakati bersama.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-stone-200/90 p-5 shadow-2xs divide-y divide-stone-100">
        {highlights.length === 0 ? (
          <p className="text-center py-6 text-xs text-stone-400 italic">
            Susunan acara sedang dalam tahap penyesuaian oleh wedding planner.
          </p>
        ) : (
          highlights.map((item, idx) => (
            <div
              key={`${item.orderIndex}-${idx}`}
              className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 font-mono text-xs font-bold text-stone-600">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold text-stone-900 leading-snug">
                  {item.title}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 rounded-lg bg-stone-50 border border-stone-200/60 px-2.5 py-1 text-xs font-mono font-bold text-stone-800">
                <Clock className="h-3.5 w-3.5 text-amber-700" />
                <span>
                  {item.startTime} - {item.endTime}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
