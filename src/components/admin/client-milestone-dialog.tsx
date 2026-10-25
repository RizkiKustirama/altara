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
import { createPaymentMilestoneAction } from "@/actions/budget-actions";
import { CreditCard, Loader2 } from "lucide-react";

interface ClientMilestoneDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const TITLE_SUGGESTIONS = [
  "DP 1 (Tanda Jadi / Booking)",
  "DP 2 (Progres 50% & Fiksasi Vendor)",
  "DP 3 (Technical Meeting / H-30)",
  "Pelunasan (H-14 Sebelum Acara)",
];

export function ClientMilestoneDialog({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: ClientMilestoneDialogProps) {
  const [title, setTitle] = useState<string>(TITLE_SUGGESTIONS[0] ?? "");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<"PENDING" | "PAID" | "OVERDUE">("PENDING");
  const [proofFileUrl, setProofFileUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Nama termin wajib diisi");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Nominal termin harus berupa angka positif");
      return;
    }
    if (!dueDate) {
      toast.error("Tanggal jatuh tempo wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await createPaymentMilestoneAction({
        projectId,
        title: title.trim(),
        amount,
        dueDate,
        status,
        proofFileUrl: proofFileUrl.trim() || null,
      });

      if (res.success) {
        toast.success("Termin pembayaran klien berhasil ditambahkan!");
        onSuccess();
        onOpenChange(false);
        // Reset
        setAmount("");
        setProofFileUrl("");
        setStatus("PENDING");
      } else {
        toast.error(res.error?.message ?? "Gagal menambahkan termin");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-stone-100 text-stone-800">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Tambah Termin Pembayaran Klien
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Jadwalkan termin penagihan (DP / Pelunasan) untuk pengantin.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title with Preset quick-select */}
          <div className="space-y-1.5">
            <label
              htmlFor="milestoneTitle"
              className="text-xs font-semibold text-stone-700 block"
            >
              Nama / Tahapan Termin <span className="text-red-500">*</span>
            </label>
            <Input
              id="milestoneTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: DP 1 (Booking Fee)"
              required
              className="text-xs font-medium"
            />
            <div className="flex flex-wrap gap-1 mt-1">
              {TITLE_SUGGESTIONS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setTitle(preset)}
                  className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded-md transition-colors"
                >
                  {preset.split(" (")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Due Date in 2 Cols */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="amount"
                className="text-xs font-semibold text-stone-700 block"
              >
                Nominal Tagihan (Rp) <span className="text-red-500">*</span>
              </label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 50000000"
                required
                className="text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="dueDate"
                className="text-xs font-semibold text-stone-700 block"
              >
                Jatuh Tempo <span className="text-red-500">*</span>
              </label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              Status Awal
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "PENDING" | "PAID" | "OVERDUE")
              }
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-medium"
            >
              <option value="PENDING">Belum Bayar (Pending)</option>
              <option value="PAID">Lunas (Paid)</option>
              <option value="OVERDUE">Jatuh Tempo (Overdue)</option>
            </select>
          </div>

          {/* Proof File URL */}
          <div className="space-y-1.5">
            <label
              htmlFor="proofFileUrl"
              className="text-xs font-semibold text-stone-700 block"
            >
              Tautan Bukti Transfer (Opsional)
            </label>
            <Input
              id="proofFileUrl"
              type="url"
              value={proofFileUrl}
              onChange={(e) => setProofFileUrl(e.target.value)}
              placeholder="https://storage.altara.id/proofs/dp1.jpg"
              className="text-xs font-mono"
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
              disabled={loading}
              className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                "Simpan Termin"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
