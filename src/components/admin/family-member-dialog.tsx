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
  createWeddingPartyMemberAction,
  updateWeddingPartyMemberAction,
} from "@/actions/wedding-party-actions";
import type { WeddingParty } from "@/db/schema/wedding-parties";
import type { RelationshipType } from "@/schemas/wedding-party-schema";
import { Users, Loader2 } from "lucide-react";

interface FamilyMemberDialogProps {
  projectId: string;
  member?: WeddingParty | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: "AYAH_CPW", label: "Ayah Pengantin Wanita (CPW)" },
  { value: "IBU_CPW", label: "Ibu Pengantin Wanita (CPW)" },
  { value: "AYAH_CPP", label: "Ayah Pengantin Pria (CPP)" },
  { value: "IBU_CPP", label: "Ibu Pengantin Pria (CPP)" },
  { value: "SAKSI_NIKAH_CPW", label: "Saksi Nikah Pihak Wanita" },
  { value: "SAKSI_NIKAH_CPP", label: "Saksi Nikah Pihak Pria" },
  { value: "PENGIRING_BRIDESMAID", label: "Bridesmaid / Pengiring Wanita" },
  { value: "PENGIRING_GROOMSMEN", label: "Groomsmen / Pengiring Pria" },
  { value: "VIP", label: "Tamu Kehormatan (VIP)" },
  { value: "KELUARGA_BESAR", label: "Keluarga Besar" },
  { value: "OTHER", label: "Lainnya" },
];

export function FamilyMemberDialog({
  projectId,
  member,
  open,
  onOpenChange,
  onSuccess,
}: FamilyMemberDialogProps) {
  const isEdit = Boolean(member);

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<RelationshipType>("AYAH_CPW");
  const [phone, setPhone] = useState("");
  const [ceremonialRole, setCeremonialRole] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setRelationship(member.relationship as RelationshipType);
      setPhone(member.phone ?? "");
      setCeremonialRole(member.ceremonialRole ?? "");
      setNotes(member.notes ?? "");
    } else {
      setName("");
      setRelationship("AYAH_CPW");
      setPhone("");
      setCeremonialRole("");
      setNotes("");
    }
  }, [member, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama anggota keluarga wajib diisi");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && member) {
        const res = await updateWeddingPartyMemberAction({
          id: member.id,
          projectId,
          name: name.trim(),
          relationship,
          phone: phone.trim() || null,
          ceremonialRole: ceremonialRole.trim() || null,
          notes: notes.trim() || null,
        });

        if (res.success) {
          toast.success("Data keluarga berhasil diperbarui!");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(res.error?.message ?? "Gagal memperbarui data");
        }
      } else {
        const res = await createWeddingPartyMemberAction({
          projectId,
          name: name.trim(),
          relationship,
          phone: phone.trim() || null,
          ceremonialRole: ceremonialRole.trim() || null,
          notes: notes.trim() || null,
        });

        if (res.success) {
          toast.success("Anggota keluarga/saksi berhasil ditambahkan!");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(res.error?.message ?? "Gagal menambahkan data");
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-stone-100 text-stone-800">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isEdit ? "Edit Anggota Keluarga / VIP" : "Tambah Anggota Keluarga / Saksi"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Catat kontak darurat, wali, saksi nikah, atau peran dalam prosesi seremonial.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-stone-700 block">
              Nama Lengkap & Gelar <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Contoh: Ir. H. Bambang Soedarmono, M.M."
              required
              className="text-xs font-medium"
            />
          </div>

          {/* Relationship & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                Hubungan Keluarga
              </label>
              <select
                value={relationship}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setRelationship(e.target.value as RelationshipType)
                }
                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-medium"
              >
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ceremonialRole" className="text-xs font-semibold text-stone-700 block">
                Peran Seremonial
              </label>
              <Input
                id="ceremonialRole"
                value={ceremonialRole}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCeremonialRole(e.target.value)}
                placeholder="Misal: Wali Nikah, Saksi Pria"
                className="text-xs"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs font-semibold text-stone-700 block">
              Nomor WhatsApp / Telepon
            </label>
            <Input
              id="phone"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              placeholder="081234567890"
              className="text-xs font-mono"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-xs font-semibold text-stone-700 block">
              Catatan / Posisi Duduk di Meja Akad
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder="Misal: Duduk di sebelah kanan penghulu..."
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
                "Perbarui Anggota"
              ) : (
                "Tambah Anggota"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
