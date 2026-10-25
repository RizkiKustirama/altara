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
  allocateBudgetCategoryAction,
  updateBudgetCategoryAction,
} from "@/actions/budget-actions";
import type { ProjectBudget } from "@/db/schema/operational-budgets";
import { PieChart, Loader2 } from "lucide-react";

interface BudgetItemDialogProps {
  projectId: string;
  categoryItem?: ProjectBudget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CATEGORY_SUGGESTIONS = [
  "VENUE",
  "CATERING",
  "DECORATION",
  "MUA_HAIRDO",
  "PHOTO_VIDEO",
  "SOUND_LIGHTING",
  "MC",
  "ATTIRE",
  "ENTERTAINMENT",
  "SOUVENIR",
  "OTHER",
];

export function BudgetItemDialog({
  projectId,
  categoryItem,
  open,
  onOpenChange,
  onSuccess,
}: BudgetItemDialogProps) {
  const isEdit = Boolean(categoryItem);

  const [category, setCategory] = useState("VENUE");
  const [allocatedAmount, setAllocatedAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryItem) {
      setCategory(categoryItem.category);
      setAllocatedAmount(categoryItem.allocatedAmount);
      setNotes(categoryItem.notes ?? "");
    } else {
      setCategory("VENUE");
      setAllocatedAmount("");
      setNotes("");
    }
  }, [categoryItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatedAmount || parseFloat(allocatedAmount) < 0) {
      toast.error("Nominal alokasi harus berupa angka valid");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && categoryItem) {
        const res = await updateBudgetCategoryAction({
          budgetId: categoryItem.id,
          projectId,
          category,
          allocatedAmount,
          notes: notes.trim() || null,
        });

        if (res.success) {
          toast.success("Alokasi pos bujet berhasil diperbarui!");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(res.error?.message ?? "Gagal memperbarui alokasi");
        }
      } else {
        const res = await allocateBudgetCategoryAction({
          projectId,
          category,
          allocatedAmount,
          notes: notes.trim() || null,
        });

        if (res.success) {
          toast.success("Pos alokasi bujet berhasil ditambahkan!");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(res.error?.message ?? "Gagal menambahkan alokasi");
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
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-stone-100 text-stone-800">
              <PieChart className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isEdit ? "Edit Alokasi Pos Bujet" : "Alokasikan Pos Bujet Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Tentukan batas alokasi pengeluaran untuk pos kebutuhan ini.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              Pos Kebutuhan Acara <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-medium"
            >
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label htmlFor="allocatedAmount" className="text-xs font-semibold text-stone-700 block">
              Nominal Alokasi (Rupiah) <span className="text-red-500">*</span>
            </label>
            <Input
              id="allocatedAmount"
              type="number"
              value={allocatedAmount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAllocatedAmount(e.target.value)}
              placeholder="Contoh: 75000000"
              required
              className="text-xs font-mono font-bold"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-xs font-semibold text-stone-700 block">
              Catatan / Spesifikasi Paket
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder="Contoh: Termasuk 800 porsi buffet dan 4 macam pondokan..."
              rows={2}
              className="flex min-h-[50px] w-full rounded-md border border-input bg-card px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none text-foreground"
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
              ) : isEdit ? (
                "Perbarui Alokasi"
              ) : (
                "Simpan Alokasi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
