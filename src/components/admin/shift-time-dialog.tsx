"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { shiftRundownTimeAction } from "@/actions/rundown-actions";
import type { ProjectRundown } from "@/db/schema/rundowns";
import { addMinutesToTime } from "@/lib/rundown-time";
import { ArrowRight, FastForward, Loader2 } from "lucide-react";

interface ShiftTimeDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ProjectRundown[];
  initialItemIndex?: number;
  onSuccess: () => void;
}

export function ShiftTimeDialog({
  projectId,
  open,
  onOpenChange,
  items,
  initialItemIndex = 0,
  onSuccess,
}: ShiftTimeDialogProps) {
  const [startIndex, setStartIndex] = useState<number>(initialItemIndex);
  const [deltaMinutes, setDeltaMinutes] = useState<number>(15);
  const [loading, setLoading] = useState<boolean>(false);

  const selectedItem = items.find((it) => it.orderIndex === startIndex) ?? items[0];

  const previewNewStart = selectedItem
    ? addMinutesToTime(selectedItem.startTime, deltaMinutes)
    : "";
  const previewNewEnd = selectedItem
    ? addMinutesToTime(selectedItem.endTime, deltaMinutes)
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deltaMinutes === 0) {
      toast.error("Pergeseran waktu tidak boleh 0 menit");
      return;
    }

    setLoading(true);
    try {
      const res = await shiftRundownTimeAction({
        projectId,
        startFromIndex: startIndex,
        deltaMinutes,
      });

      if (res.success) {
        toast.success(
          `Jadwal berhasil digeser ${deltaMinutes > 0 ? `+${deltaMinutes}` : deltaMinutes} menit berantai!`
        );
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.error?.message ?? "Gagal menggeser waktu rundown");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const quickDeltas = [
    { label: "+10 m", value: 10 },
    { label: "+15 m (Rekomendasi)", value: 15 },
    { label: "+30 m (Delay)", value: 30 },
    { label: "-15 m (Maju)", value: -15 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <FastForward className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Geser Waktu Berantai (Shift Time Delay)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Maju atau mundurkan jam seluruh sesi berikutnya secara otomatis akibat keterlambatan di venue.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Starting Item Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              Mulai Digeser Dari Sesi
            </label>
            <select
              value={String(startIndex)}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStartIndex(parseInt(e.target.value, 10))}
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-medium"
            >
              {items.map((it) => (
                <option key={it.id} value={String(it.orderIndex)}>
                  #{it.orderIndex + 1} ({it.startTime.slice(0, 5)}) - {it.title}
                </option>
              ))}
            </select>
          </div>

          {/* Delta Input & Quick Chips */}
          <div className="space-y-2">
            <label htmlFor="deltaMinutes" className="text-xs font-semibold text-stone-700 block">
              Durasi Pergeseran (Menit)
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="deltaMinutes"
                type="number"
                value={deltaMinutes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDeltaMinutes(parseInt(e.target.value, 10) || 0)
                }
                required
                className="text-xs font-mono w-28"
              />
              <span className="text-xs text-muted-foreground">
                Gunakan nilai positif (+) untuk delay / mundur, negatif (-) untuk maju.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {quickDeltas.map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => setDeltaMinutes(q.value)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors ${
                    deltaMinutes === q.value
                      ? "border-amber-600 bg-amber-50 text-amber-800"
                      : "border-border hover:bg-stone-100 text-stone-600"
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Card */}
          {selectedItem && (
            <div className="p-3 rounded-lg border border-amber-200/70 bg-amber-50/50 space-y-1.5">
              <div className="text-[11px] font-semibold text-amber-900 flex items-center justify-between">
                <span>Pratinjau Dampak Pergeseran:</span>
                <span className="font-mono">
                  {deltaMinutes > 0 ? `+${deltaMinutes}` : deltaMinutes} Menit
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-stone-700">
                <span className="line-through text-muted-foreground">
                  {selectedItem.startTime.slice(0, 5)} - {selectedItem.endTime.slice(0, 5)}
                </span>
                <ArrowRight className="h-3 w-3 text-amber-600 shrink-0" />
                <span className="font-bold text-amber-900">
                  {previewNewStart.slice(0, 5)} - {previewNewEnd.slice(0, 5)}
                </span>
              </div>
              <p className="text-[10px] text-amber-800/80">
                Seluruh {items.length - startIndex} sesi dari &quot;{selectedItem.title}&quot; sampai akhir acara akan terupdate.
              </p>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || deltaMinutes === 0}
              className="text-xs bg-amber-600 text-white hover:bg-amber-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Menyesuaikan...</span>
                </>
              ) : (
                "Geser Jadwal Acara"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
