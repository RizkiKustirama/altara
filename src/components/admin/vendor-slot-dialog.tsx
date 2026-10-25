"use client";

import { useState } from "react";
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
import { slotVendorToProjectAction } from "@/actions/vendor-actions";
import { SlotVendorSchema } from "@/schemas/vendor-schema";
import { VENDOR_CATEGORY_OPTIONS } from "@/components/admin/vendor-form-dialog";
import type { VendorDTO } from "@/services/vendor-service";
import type { VendorCategory, ContractStatus } from "@/schemas/vendor-schema";
import { Building2, Plus, Loader2 } from "lucide-react";

interface VendorSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  masterVendors: VendorDTO[];
  onSuccess?: () => void;
}

export function VendorSlotDialog({
  open,
  onOpenChange,
  projectId,
  masterVendors,
  onSuccess,
}: VendorSlotDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory>("VENUE");
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [contractStatus, setContractStatus] = useState<ContractStatus>("BOOKED");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Filter master vendors according to currently selected category
  const categoryVendors = masterVendors.filter(
    (v) => v.category === selectedCategory && v.isActive
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId) {
      toast.error("Silakan pilih rekanan vendor dari daftar.");
      return;
    }

    setLoading(true);

    const payload = {
      projectId,
      vendorId: selectedVendorId,
      category: selectedCategory,
      contractStatus,
      notes: notes || undefined,
    };

    const parsed = SlotVendorSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Data input belum valid.");
      setLoading(false);
      return;
    }

    try {
      const res = await slotVendorToProjectAction(parsed.data);
      if (!res.success) {
        toast.error(res.error.message);
        setLoading(false);
        return;
      }

      toast.success(`Vendor ${res.data.vendorName} berhasil dipasangkan ke proyek!`);
      setSelectedVendorId("");
      setNotes("");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Terjadi gangguan saat memasangkan vendor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-stone-700" />
            <span>Pasangkan Rekanan Vendor ke Proyek</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Pilih kategori kebutuhan acara dan tentukan rekanan resmi yang akan menangani.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Pilih Kategori */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Kategori Kebutuhan Acara <span className="text-destructive">*</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as VendorCategory);
                setSelectedVendorId(""); // reset vendor selection
              }}
              disabled={loading}
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
            >
              {VENDOR_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Vendor dari Master Katalog */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">
                Pilih Rekanan Vendor <span className="text-destructive">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                {categoryVendors.length} vendor tersedia
              </span>
            </div>

            {categoryVendors.length === 0 ? (
              <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                Belum ada master vendor untuk kategori ini. Silakan daftarkan vendor di menu Master Rekanan.
              </div>
            ) : (
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                disabled={loading}
                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                required
              >
                <option value="">-- Pilih Rekanan Resmi --</option>
                {categoryVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendorName} (PIC: {v.picName} - {v.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Status Awal Kontrak */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Status Kesepakatan Awal
            </label>
            <select
              value={contractStatus}
              onChange={(e) => setContractStatus(e.target.value as ContractStatus)}
              disabled={loading}
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
            >
              <option value="INQUIRY">Penjajakan (Inquiry)</option>
              <option value="BOOKED">Terkonfirmasi Resmi (Booked)</option>
              <option value="DP_PAID">DP Terbayar (DP Paid)</option>
              <option value="SETTLED">Lunas (Settled)</option>
            </select>
          </div>

          {/* Catatan SOW / Kebutuhan Khusus */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Catatan Kebutuhan / Paket SOW (Opsional)
            </label>
            <Input
              placeholder="Contoh: Paket 1000 porsi buffet, tema pelaminan lavender"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border/70">
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
              disabled={loading || categoryVendors.length === 0}
              className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              <span>Pasangkan Vendor</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
