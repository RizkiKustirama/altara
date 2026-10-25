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
import { recordVendorInvoiceAction } from "@/actions/budget-actions";
import { Receipt, Loader2 } from "lucide-react";

interface VendorInvoiceDialogProps {
  projectId: string;
  projectVendors: Array<{
    id: string;
    vendorName: string;
    category: string;
  }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VendorInvoiceDialog({
  projectId,
  projectVendors,
  open,
  onOpenChange,
  onSuccess,
}: VendorInvoiceDialogProps) {
  const [projectVendorId, setProjectVendorId] = useState(
    projectVendors[0]?.id ?? ""
  );
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<
    "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE"
  >("PENDING");
  const [invoiceFileUrl, setInvoiceFileUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-sync projectVendorId when projectVendors change
  React.useEffect(() => {
    if (projectVendors.length > 0 && !projectVendorId) {
      setProjectVendorId(projectVendors[0]?.id ?? "");
    }
  }, [projectVendors, projectVendorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectVendorId) {
      toast.error("Pilih rekanan vendor terlebih dahulu");
      return;
    }
    if (!invoiceNumber.trim()) {
      toast.error("Nomor invoice wajib diisi");
      return;
    }
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast.error("Nominal tagihan harus berupa angka positif");
      return;
    }
    if (!dueDate) {
      toast.error("Tanggal jatuh tempo wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await recordVendorInvoiceAction({
        projectId,
        projectVendorId,
        invoiceNumber: invoiceNumber.trim(),
        totalAmount,
        dueDate,
        status,
        invoiceFileUrl: invoiceFileUrl.trim() || null,
      });

      if (res.success) {
        toast.success("Invoice vendor berhasil dicatat!");
        onSuccess();
        onOpenChange(false);
        // Reset form
        setInvoiceNumber("");
        setTotalAmount("");
        setInvoiceFileUrl("");
        setStatus("PENDING");
      } else {
        toast.error(res.error?.message ?? "Gagal mencatat invoice vendor");
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
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Catat Tagihan Invoice Vendor
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Dokumentasikan tagihan resmi rekanan vendor yang bertugas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Vendor Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              Pilih Rekanan Vendor <span className="text-red-500">*</span>
            </label>
            {projectVendors.length === 0 ? (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-md border border-rose-200">
                Belum ada vendor rekanan yang ditugaskan di proyek ini. Silakan
                tugaskan rekanan di tab Rekanan Vendor terlebih dahulu.
              </p>
            ) : (
              <select
                value={projectVendorId}
                onChange={(e) => setProjectVendorId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-medium"
                required
              >
                {projectVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendorName} ({v.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Invoice Number */}
          <div className="space-y-1.5">
            <label
              htmlFor="invoiceNumber"
              className="text-xs font-semibold text-stone-700 block"
            >
              Nomor Invoice Tagihan <span className="text-red-500">*</span>
            </label>
            <Input
              id="invoiceNumber"
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Contoh: INV-2026-CAT-001"
              required
              className="text-xs font-mono font-medium"
            />
          </div>

          {/* Amount & Due Date in 2 Cols */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="totalAmount"
                className="text-xs font-semibold text-stone-700 block"
              >
                Nominal Tagihan (Rp) <span className="text-red-500">*</span>
              </label>
              <Input
                id="totalAmount"
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="Contoh: 35000000"
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
              Status Pembayaran Awal
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE"
                )
              }
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-medium"
            >
              <option value="PENDING">Menunggu (Pending)</option>
              <option value="PARTIALLY_PAID">Dibayar Sebagian (Partially Paid)</option>
              <option value="PAID">Lunas (Paid)</option>
              <option value="OVERDUE">Jatuh Tempo (Overdue)</option>
            </select>
          </div>

          {/* Invoice File URL */}
          <div className="space-y-1.5">
            <label
              htmlFor="invoiceFileUrl"
              className="text-xs font-semibold text-stone-700 block"
            >
              Tautan Berkas Tagihan PDF / Gambar (Opsional)
            </label>
            <Input
              id="invoiceFileUrl"
              type="url"
              value={invoiceFileUrl}
              onChange={(e) => setInvoiceFileUrl(e.target.value)}
              placeholder="https://storage.altara.id/invoices/inv-001.pdf"
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
              disabled={loading || projectVendors.length === 0}
              className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                "Simpan Tagihan Invoice"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
