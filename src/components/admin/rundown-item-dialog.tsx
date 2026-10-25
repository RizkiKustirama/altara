"use client";

import React, { useState, useEffect } from "react";
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
import {
  createRundownItemAction,
  updateRundownItemAction,
} from "@/actions/rundown-actions";
import type { ProjectRundown } from "@/db/schema/rundowns";
import { calculateDurationMinutes } from "@/lib/rundown-time";
import { Music, SunMedium, Loader2 } from "lucide-react";

interface RundownItemDialogProps {
  projectId: string;
  item?: ProjectRundown | null;
  defaultStartTime?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const COMMON_PIC_ROLES = [
  "LEAD_PLANNER",
  "LO_BRIDE",
  "LO_GROOM",
  "LO_FAMILY",
  "RUNNER",
  "STAGE_MANAGER",
  "MC",
  "SOUND_OPERATOR",
  "CATERING_CHECKER",
];

export function RundownItemDialog({
  projectId,
  item,
  defaultStartTime = "08:00",
  open,
  onOpenChange,
  onSuccess,
}: RundownItemDialogProps) {
  const isEdit = Boolean(item);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState("09:00");
  const [picRole, setPicRole] = useState("LEAD_PLANNER");
  const [musicCue, setMusicCue] = useState("");
  const [lightingCue, setLightingCue] = useState("");
  const [status, setStatus] = useState<"PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED">("PENDING");
  const [propagateRemaining, setPropagateRemaining] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description ?? "");
      setStartTime(item.startTime.slice(0, 5));
      setEndTime(item.endTime.slice(0, 5));
      setPicRole(item.picRole ?? "LEAD_PLANNER");
      setMusicCue(item.musicCue ?? "");
      setLightingCue(item.lightingCue ?? "");
      setStatus(item.status);
      setPropagateRemaining(true);
    } else {
      setTitle("");
      setDescription("");
      setStartTime(defaultStartTime);
      // default 60m duration
      const [h, m] = defaultStartTime.split(":").map(Number);
      const nextHour = String(((h ?? 8) + 1) % 24).padStart(2, "0");
      setEndTime(`${nextHour}:${String(m ?? 0).padStart(2, "0")}`);
      setPicRole("LEAD_PLANNER");
      setMusicCue("");
      setLightingCue("");
      setStatus("PENDING");
      setPropagateRemaining(true);
    }
  }, [item, defaultStartTime, open]);

  const durationMins = calculateDurationMinutes(
    `${startTime}:00`,
    `${endTime}:00`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul agenda wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const formattedStart = startTime.length === 5 ? `${startTime}:00` : startTime;
      const formattedEnd = endTime.length === 5 ? `${endTime}:00` : endTime;

      if (isEdit && item) {
        const res = await updateRundownItemAction({
          itemId: item.id,
          projectId,
          title: title.trim(),
          description: description.trim() || null,
          startTime: formattedStart,
          endTime: formattedEnd,
          picRole: picRole || null,
          musicCue: musicCue.trim() || null,
          lightingCue: lightingCue.trim() || null,
          status,
          propagateRemaining,
        });

        if (res.success) {
          toast.success("Agenda acara berhasil diperbarui!");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(res.error?.message ?? "Gagal memperbarui agenda");
        }
      } else {
        const res = await createRundownItemAction({
          projectId,
          title: title.trim(),
          description: description.trim() || null,
          startTime: formattedStart,
          endTime: formattedEnd,
          picRole: picRole || null,
          musicCue: musicCue.trim() || null,
          lightingCue: lightingCue.trim() || null,
          status,
        });

        if (res.success) {
          toast.success("Agenda acara berhasil ditambahkan!");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(res.error?.message ?? "Gagal menambahkan agenda");
        }
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {isEdit ? "Edit Agenda Rundown" : "Tambah Agenda Baru"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEdit
              ? "Ubah waktu, PIC kru pelaksana, atau petunjuk teknis (cue sheet)."
              : "Masukkan sesi acara pernikahan ke dalam urutan rundown."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-semibold text-stone-700 block">
              Judul Sesi Acara <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Contoh: Ijab Qabul & Akad Nikah, Kirab Penganten"
              required
              className="text-xs font-medium"
            />
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="space-y-1.5">
              <label htmlFor="startTime" className="text-xs font-semibold text-stone-700 block">
                Jam Mulai
              </label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
                required
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="endTime" className="text-xs font-semibold text-stone-700 block">
                Jam Selesai
              </label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)}
                required
                className="text-xs font-mono"
              />
            </div>
            <div className="pb-1.5">
              <div className="px-2.5 py-1.5 rounded-md border border-border bg-stone-50 text-center">
                <span className="text-[10px] text-muted-foreground block leading-tight">Durasi</span>
                <span className="text-xs font-bold font-mono text-stone-800">
                  {durationMins} Menit
                </span>
              </div>
            </div>
          </div>

          {/* PIC Role & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                PIC Kru Bertanggung Jawab
              </label>
              <select
                value={picRole}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPicRole(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-medium"
              >
                {COMMON_PIC_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                Status Pelaksanaan
              </label>
              <select
                value={status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStatus(e.target.value as "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED")
                }
                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-medium"
              >
                <option value="PENDING">Menunggu (Pending)</option>
                <option value="IN_PROGRESS">Sedang Berjalan</option>
                <option value="COMPLETED">Selesai</option>
                <option value="DELAYED">Terlambat</option>
              </select>
            </div>
          </div>

          {/* Cues: Music & Lighting */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="musicCue" className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Music className="h-3 w-3 text-indigo-500" />
                <span>Audio / Petunjuk Lagu</span>
              </label>
              <Input
                id="musicCue"
                value={musicCue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMusicCue(e.target.value)}
                placeholder="Misal: Gamelan Degung / Lagu Masuk"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lightingCue" className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <SunMedium className="h-3 w-3 text-amber-500" />
                <span>Lighting / Sorot Lampu</span>
              </label>
              <Input
                id="lightingCue"
                value={lightingCue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLightingCue(e.target.value)}
                placeholder="Misal: Spotlight Meja Akad 100%"
                className="text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-semibold text-stone-700 block">
              Instruksi Teknis / Detail Acara
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Catatan alur, posisi keluarga, aba-aba MC..."
              rows={2}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-card px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none text-foreground"
            />
          </div>

          {/* Ripple propagation option for edit */}
          {isEdit && (
            <div className="flex items-start gap-2 pt-1 border-t border-border/60">
              <label htmlFor="propagateRemaining" className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="propagateRemaining"
                  checked={propagateRemaining}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPropagateRemaining(e.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span className="text-xs text-stone-700 font-medium leading-tight">
                  Otomatis sesuaikan jam sesi setelahnya jika jam selesai berubah (Time Ripple)
                </span>
              </label>
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
              disabled={loading}
              className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Menyimpan...</span>
                </>
              ) : isEdit ? (
                "Perbarui Agenda"
              ) : (
                "Tambah Agenda"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
