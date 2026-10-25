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
import { recordCrewPayoutAction } from "@/actions/finance-actions";
import { Banknote, Loader2 } from "lucide-react";

interface RecordPayoutDialogProps {
  projects: Array<{ id: string; projectName: string }>;
  crews: Array<{ id: string; fullName: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RecordPayoutDialog({
  projects,
  crews,
  open,
  onOpenChange,
  onSuccess,
}: RecordPayoutDialogProps) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [userId, setUserId] = useState(crews[0]?.id ?? "");
  const [dailyRate, setDailyRate] = useState("400000");
  const [sessionCount, setSessionCount] = useState("1.0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0]?.id ?? "");
    }
    if (crews.length > 0 && !userId) {
      setUserId(crews[0]?.id ?? "");
    }
  }, [projects, crews, projectId, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !userId) {
      toast.error("Pilih proyek dan kru terlebih dahulu");
      return;
    }
    if (!dailyRate || parseFloat(dailyRate) <= 0) {
      toast.error("Nominal daily rate harus berupa angka positif");
      return;
    }

    setLoading(true);
    try {
      const res = await recordCrewPayoutAction({
        projectId,
        userId,
        dailyRate,
        sessionCount,
        notes: notes.trim() || null,
      });

      if (res.success) {
        toast.success("Honor kru berhasil dicatat ke antrean pencairan!");
        onSuccess();
        onOpenChange(false);
        setNotes("");
      } else {
        toast.error(res.error?.message ?? "Gagal mencatat honor");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-stone-100 text-stone-800">
              <Banknote className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Catat Honor Harian Kru
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Tambahkan entri honor kru untuk pencairan akhir pekan / Senin pagi.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Select Project */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              Pilih Proyek Pernikahan <span className="text-red-500">*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs text-foreground font-medium"
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Select Crew User */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              Nama Kru Bertugas <span className="text-red-500">*</span>
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs text-foreground font-medium"
              required
            >
              {crews.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Rate & Sessions in 2 Cols */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                Daily Rate (Rp) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                placeholder="400000"
                required
                className="text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                Jumlah Sesi / Shift <span className="text-red-500">*</span>
              </label>
              <select
                value={sessionCount}
                onChange={(e) => setSessionCount(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs text-foreground font-bold font-mono"
              >
                <option value="0.5">0.5x (Setengah Hari)</option>
                <option value="1.0">1.0x (Satu Hari Penuh)</option>
                <option value="1.5">1.5x (Lembur / Akad & Resepsi)</option>
                <option value="2.0">2.0x (Dua Sesi Penuh)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              Catatan / Peran Khusus
            </label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Koordinator Lapangan / Runner VIP"
              className="text-xs"
            />
          </div>

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
              disabled={loading || projects.length === 0 || crews.length === 0}
              className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                "Simpan Honor Kru"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
