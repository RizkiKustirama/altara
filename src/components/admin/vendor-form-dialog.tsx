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
import { createVendorAction, updateVendorAction } from "@/actions/vendor-actions";
import { CreateVendorSchema } from "@/schemas/vendor-schema";
import type { VendorDTO } from "@/services/vendor-service";
import type { VendorCategory } from "@/schemas/vendor-schema";
import { Building2, User, Phone, Mail, MapPin, Loader2 } from "lucide-react";

interface VendorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorToEdit?: VendorDTO | null;
  onSuccess?: () => void;
}

export const VENDOR_CATEGORY_OPTIONS: Array<{ value: VendorCategory; label: string }> = [
  { value: "VENUE", label: "Venue & Gedung" },
  { value: "CATERING", label: "Katering & Culinary" },
  { value: "DECORATION", label: "Dekorasi & Florist" },
  { value: "MUA", label: "MUA & Hairdo" },
  { value: "PHOTO_VIDEO", label: "Fotografi & Videografi" },
  { value: "SOUND_LIGHTING", label: "Sound & Lighting" },
  { value: "MC", label: "Master of Ceremony (MC)" },
  { value: "ATTIRE", label: "Busana & Gaun Pengantin" },
  { value: "ENTERTAINMENT", label: "Entertainment & Musik" },
  { value: "OTHER", label: "Lainnya" },
];

export function VendorFormDialog({
  open,
  onOpenChange,
  vendorToEdit,
  onSuccess,
}: VendorFormDialogProps) {
  const isEdit = Boolean(vendorToEdit);

  const [formData, setFormData] = useState({
    vendorName: vendorToEdit?.vendorName ?? "",
    category: (vendorToEdit?.category as VendorCategory) ?? "VENUE",
    picName: vendorToEdit?.picName ?? "",
    phone: vendorToEdit?.phone ?? "",
    email: vendorToEdit?.email ?? "",
    address: vendorToEdit?.address ?? "",
    isActive: vendorToEdit?.isActive ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const parsed = CreateVendorSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[String(err.path[0])] = err.message;
        }
      });
      setErrors(fieldErrors);
      setLoading(false);
      toast.error("Mohon periksa input form yang belum valid.");
      return;
    }

    try {
      if (isEdit && vendorToEdit) {
        const res = await updateVendorAction({
          id: vendorToEdit.id,
          ...parsed.data,
        });

        if (!res.success) {
          toast.error(res.error.message);
          setLoading(false);
          return;
        }
        toast.success(`Data vendor "${res.data.vendorName}" berhasil diperbarui!`);
      } else {
        const res = await createVendorAction(parsed.data);

        if (!res.success) {
          toast.error(res.error.message);
          setLoading(false);
          return;
        }
        toast.success(`Vendor "${res.data.vendorName}" berhasil didaftarkan!`);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Terjadi gangguan saat menyimpan data vendor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground">
            {isEdit ? "Edit Rekanan Vendor" : "Daftarkan Vendor Rekanan Baru"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEdit
              ? "Perbarui informasi kontak PIC, kategori, atau status keaktifan rekanan."
              : "Tambahkan vendor resmi ke katalog master untuk kemudahan slotting proyek."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Vendor Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-stone-500" />
                <span>Nama Vendor</span> <span className="text-destructive">*</span>
              </label>
              <Input
                name="vendorName"
                placeholder="Contoh: Hotel Mulia"
                value={formData.vendorName}
                onChange={handleChange}
                disabled={loading}
                className={errors.vendorName ? "border-destructive text-xs" : "text-xs"}
              />
              {errors.vendorName && (
                <span className="text-[11px] text-destructive">{errors.vendorName}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Kategori Layanan <span className="text-destructive">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
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
          </div>

          {/* PIC Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-stone-500" />
                <span>Nama PIC Vendor</span> <span className="text-destructive">*</span>
              </label>
              <Input
                name="picName"
                placeholder="Contoh: Bpk. Robert Setiawan"
                value={formData.picName}
                onChange={handleChange}
                disabled={loading}
                className={errors.picName ? "border-destructive text-xs" : "text-xs"}
              />
              {errors.picName && (
                <span className="text-[11px] text-destructive">{errors.picName}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-stone-500" />
                <span>Nomor WhatsApp / HP</span> <span className="text-destructive">*</span>
              </label>
              <Input
                name="phone"
                placeholder="081234567890"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                className={errors.phone ? "border-destructive text-xs" : "text-xs"}
              />
              {errors.phone && (
                <span className="text-[11px] text-destructive">{errors.phone}</span>
              )}
            </div>
          </div>

          {/* Email & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-stone-500" />
                <span>Email Resmi</span>
              </label>
              <Input
                name="email"
                type="email"
                placeholder="info@vendor.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={errors.email ? "border-destructive text-xs" : "text-xs"}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-stone-500" />
                <span>Kota / Alamat Singkat</span>
              </label>
              <Input
                name="address"
                placeholder="Senayan, Jakarta Pusat"
                value={formData.address}
                onChange={handleChange}
                disabled={loading}
                className="text-xs"
              />
            </div>
          </div>

          {/* Status Keaktifan */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-500"
            />
            <label htmlFor="isActive" className="text-xs text-foreground cursor-pointer select-none">
              Tandai sebagai Rekanan Aktif
            </label>
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
              disabled={loading}
              className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isEdit ? "Simpan Perubahan" : "Daftarkan Vendor"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
