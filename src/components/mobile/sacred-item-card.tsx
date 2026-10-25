"use client";

import React, { useState } from "react";
import type { SacredBelongingDTO } from "@/services/logistics-service";
import {
  Package,
  Scroll,
  Gift,
  Shirt,
  Sparkles,
  MapPin,
  User,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ChevronRight,
  Edit2,
} from "lucide-react";

interface SacredItemCardProps {
  item: SacredBelongingDTO;
  projectId: string;
  crews: Array<{ id: string; fullName: string; role: string }>;
  onStatusChange: (
    newStatus: "NOT_RECEIVED" | "WITH_CREW" | "AT_STAGE" | "RETURNED_TO_FAMILY",
    newLocation?: string,
    newHolderId?: string | null
  ) => Promise<void>;
}

const STAGES: Array<{
  status: "NOT_RECEIVED" | "WITH_CREW" | "AT_STAGE" | "RETURNED_TO_FAMILY";
  label: string;
  step: number;
}> = [
  { status: "NOT_RECEIVED", label: "Belum Diterima", step: 1 },
  { status: "WITH_CREW", label: "Pegang Kru", step: 2 },
  { status: "AT_STAGE", label: "Di Meja Akad", step: 3 },
  { status: "RETURNED_TO_FAMILY", label: "Diserahkan ke Keluarga", step: 4 },
];

export function SacredItemCard({
  item,
  crews,
  onStatusChange,
}: SacredItemCardProps) {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editLocation, setEditLocation] = useState(item.currentLocation);
  const [editHolderId, setEditHolderId] = useState(item.currentHolderId ?? "");

  const currentStep =
    STAGES.find((s) => s.status === item.status)?.step ?? 1;

  // Determine Item Icon
  const nameUpper = item.itemName.toUpperCase();
  let ItemIcon = Package;
  if (nameUpper.includes("CINCIN") || nameUpper.includes("RING")) {
    ItemIcon = Sparkles;
  } else if (nameUpper.includes("BUKU") || nameUpper.includes("DOKUMEN")) {
    ItemIcon = Scroll;
  } else if (nameUpper.includes("MAHAR") || nameUpper.includes("KAS")) {
    ItemIcon = Gift;
  } else if (nameUpper.includes("GAUN") || nameUpper.includes("JAS")) {
    ItemIcon = Shirt;
  }

  // Get Next Stage in the flow
  const nextStage = STAGES.find((s) => s.step === currentStep + 1);

  const handleAdvance = async () => {
    if (!nextStage) return;
    setLoading(true);
    try {
      await onStatusChange(nextStage.status);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onStatusChange(
        item.status,
        editLocation.trim() || item.currentLocation,
        editHolderId || null
      );
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="rounded-2xl border border-stone-800 bg-stone-900/90 p-4 shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ItemIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100">{item.itemName}</h3>
            <p className="text-[11px] text-stone-400 line-clamp-1">{item.notes || "-"}</p>
          </div>
        </div>

        {/* Step Badge */}
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            item.status === "RETURNED_TO_FAMILY"
              ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
              : item.status === "NOT_RECEIVED"
              ? "bg-rose-950/80 text-rose-300 border border-rose-800/40"
              : "bg-amber-950/80 text-amber-300 border border-amber-800/40"
          }`}
        >
          Tahap {currentStep}/4
        </span>
      </div>

      {/* 4-Step Progress Indicator Bar */}
      <div className="mt-3.5 flex items-center justify-between gap-1">
        {STAGES.map((s) => {
          const isPassed = s.step <= currentStep;
          const isCurrent = s.step === currentStep;

          return (
            <div key={s.status} className="flex-1 flex flex-col items-center">
              <div
                className={`h-1.5 w-full rounded-full transition-all ${
                  isCurrent
                    ? "bg-amber-400 shadow-sm shadow-amber-500/50"
                    : isPassed
                    ? "bg-emerald-500"
                    : "bg-stone-800"
                }`}
              />
              <span
                className={`text-[9px] mt-1 text-center font-medium leading-none ${
                  isCurrent
                    ? "text-amber-300 font-bold"
                    : isPassed
                    ? "text-stone-300"
                    : "text-stone-600"
                }`}
              >
                {s.label.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Location & Current Holder Info */}
      <div className="mt-3.5 space-y-1.5 rounded-xl bg-stone-950/70 p-2.5 border border-stone-800/80 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-stone-300">
            <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-stone-400">Lokasi:</span>
            <span className="font-semibold text-stone-200">{item.currentLocation}</span>
          </div>

          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="text-[10px] text-stone-400 hover:text-amber-300 flex items-center gap-1 py-0.5 px-1.5 rounded active:bg-stone-800"
          >
            <Edit2 className="h-2.5 w-2.5" />
            <span>{editing ? "Tutup" : "Ubah"}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-stone-300">
          <User className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <span className="text-stone-400">Pegang:</span>
          <span className="font-semibold text-stone-200">
            {item.holderName || "Belum Ditentukan"}
          </span>
          {item.holderPhone && (
            <a
              href={`https://wa.me/${item.holderPhone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-emerald-400 underline font-mono ml-1"
            >
              (WA)
            </a>
          )}
        </div>
      </div>

      {/* Inline Edit Form */}
      {editing && (
        <form
          onSubmit={handleSaveDetails}
          className="mt-2.5 space-y-2 rounded-xl bg-stone-950 p-3 border border-stone-800"
        >
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-stone-400 block">
              Posisi / Lokasi Fisik Saat Ini
            </label>
            <input
              type="text"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="w-full h-8 rounded-lg bg-stone-900 border border-stone-700 px-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-stone-400 block">
              Kru Pemegang Fisik
            </label>
            <select
              value={editHolderId}
              onChange={(e) => setEditHolderId(e.target.value)}
              className="w-full h-8 rounded-lg bg-stone-900 border border-stone-700 px-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Belum Ditentukan --</option>
              {crews.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.role.replace(/_/g, " ")})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-2.5 py-1 text-xs text-stone-400 hover:text-stone-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-md"
            >
              Simpan Posisi
            </button>
          </div>
        </form>
      )}

      {/* 1-Tap Advance Action Button (>= 44px) */}
      <div className="mt-3 pt-2.5 border-t border-stone-800/80">
        {nextStage ? (
          <button
            type="button"
            disabled={loading}
            onClick={handleAdvance}
            className="w-full min-h-[44px] flex items-center justify-between rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700/80 px-4 text-xs font-bold text-amber-300 active:scale-[0.98] transition-all shadow-sm"
          >
            <div className="flex items-center gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              ) : (
                <ArrowRight className="h-4 w-4 text-amber-400" />
              )}
              <span>Lanjut ke: {nextStage.label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-400" />
          </button>
        ) : (
          <div className="flex min-h-[40px] items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 rounded-xl border border-emerald-900/60">
            <CheckCircle2 className="h-4 w-4" />
            <span>Telah Diserahkan Kembali ke Keluarga</span>
          </div>
        )}
      </div>
    </article>
  );
}
