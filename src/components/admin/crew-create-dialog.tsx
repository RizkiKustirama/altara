"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Loader2, Shield, Phone, Mail, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCrewMemberAction } from "@/actions/crew-actions";

export function CrewCreateDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "CREW" as "MANAGEMENT" | "CREW",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createCrewMemberAction(formData);
      if (res.success) {
        toast.success(`Anggota baru ${res.data.fullName} berhasil didaftarkan!`);
        setOpen(false);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          role: "CREW",
        });
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("Terjadi kesalahan saat mendaftarkan anggota tim.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-sm">
          <UserPlus className="h-4 w-4" />
          Tambah Anggota Kru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-stone-900">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Pendaftaran Kru & Tim Baru
            </DialogTitle>
            <DialogDescription className="text-stone-500 text-xs">
              Daftarkan staf tetap atau kru freelancer ke dalam direktori agensi Altara Studio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-sm">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-stone-400" />
                Nama Lengkap
              </label>
              <Input
                required
                placeholder="Contoh: Rian Hidayat"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-stone-400" />
                Alamat Email Kantor
              </label>
              <Input
                required
                type="email"
                placeholder="rian@altara.id"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-stone-400" />
                Nomor WhatsApp Aktif
              </label>
              <Input
                required
                placeholder="081234567890"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
              <p className="text-[11px] text-stone-400">
                Akan digunakan untuk koordinasi grup dan WhatsApp TM Quick-Action.
              </p>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-stone-400" />
                Peran Sistem (*System Role*)
              </label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: e.target.value as "MANAGEMENT" | "CREW",
                  }))
                }
              >
                <option value="CREW">CREW (Lead Planner / PM & Staf Kru Lapangan)</option>
                <option value="MANAGEMENT">MANAGEMENT (Manajer Operasional / Maya)</option>
              </select>
              <p className="text-[11px] text-stone-400">
                Kata sandi awal otomatis diatur ke <code>password123</code>.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-stone-900 hover:bg-stone-800 text-stone-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                "Simpan Anggota"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
