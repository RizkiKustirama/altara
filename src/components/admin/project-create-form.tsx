"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createProjectAction } from "@/actions/project-actions";
import { CreateProjectSchema } from "@/schemas/project-schema";
import { Sparkles, Calendar, MapPin, Building, Users } from "lucide-react";

export function ProjectCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    projectName: "",
    clientGroomName: "",
    clientBrideName: "",
    weddingDate: "",
    venueName: "",
    venueAddress: "",
    contractAmount: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    // clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAutoFillProjectName = () => {
    if (formData.clientGroomName && formData.clientBrideName) {
      setFormData((prev) => ({
        ...prev,
        projectName: `The Wedding of ${formData.clientBrideName} & ${formData.clientGroomName}`,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const parsed = CreateProjectSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[String(err.path[0])] = err.message;
        }
      });
      setErrors(fieldErrors);
      setLoading(false);
      toast.error("Mohon periksa kembali formulir yang belum lengkap.");
      return;
    }

    try {
      const result = await createProjectAction(parsed.data);

      if (!result.success) {
        toast.error(result.error.message);
        setLoading(false);
        return;
      }

      toast.success(`Proyek "${result.data.projectName}" berhasil didaftarkan!`);
      // Redirect directly to squad allocation page
      router.push(`/projects/${result.data.id}/squad`);
    } catch {
      toast.error("Terjadi kesalahan saat memproses data.");
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 border-border/80 bg-card shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Informasi Pernikahan Pengantin
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Lengkapi data dasar pengantin, tanggal acara, dan lokasi venue pernikahan.
          </p>
        </div>

        {/* Groom & Bride Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nama Pengantin Pria <span className="text-destructive">*</span>
            </label>
            <Input
              name="clientGroomName"
              placeholder="Contoh: Kevin Sanjaya"
              value={formData.clientGroomName}
              onChange={handleChange}
              onBlur={handleAutoFillProjectName}
              disabled={loading}
              className={errors.clientGroomName ? "border-destructive" : ""}
            />
            {errors.clientGroomName && (
              <span className="text-[11px] text-destructive">
                {errors.clientGroomName}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nama Pengantin Wanita <span className="text-destructive">*</span>
            </label>
            <Input
              name="clientBrideName"
              placeholder="Contoh: Bella Clarissa"
              value={formData.clientBrideName}
              onChange={handleChange}
              onBlur={handleAutoFillProjectName}
              disabled={loading}
              className={errors.clientBrideName ? "border-destructive" : ""}
            />
            {errors.clientBrideName && (
              <span className="text-[11px] text-destructive">
                {errors.clientBrideName}
              </span>
            )}
          </div>
        </div>

        {/* Project Name */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              Nama Proyek Acara <span className="text-destructive">*</span>
            </label>
            <button
              type="button"
              onClick={handleAutoFillProjectName}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <Sparkles className="h-3 w-3" />
              <span>Otomatisasi Nama</span>
            </button>
          </div>
          <Input
            name="projectName"
            placeholder="The Wedding of Bella & Kevin"
            value={formData.projectName}
            onChange={handleChange}
            disabled={loading}
            className={errors.projectName ? "border-destructive" : ""}
          />
          {errors.projectName && (
            <span className="text-[11px] text-destructive">
              {errors.projectName}
            </span>
          )}
        </div>

        {/* Wedding Date & Plafon Kontrak */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-stone-500" />
              <span>Tanggal Acara Hari-H</span> <span className="text-destructive">*</span>
            </label>
            <Input
              name="weddingDate"
              type="date"
              value={formData.weddingDate}
              onChange={handleChange}
              disabled={loading}
              className={errors.weddingDate ? "border-destructive" : ""}
            />
            {errors.weddingDate && (
              <span className="text-[11px] text-destructive">
                {errors.weddingDate}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Plafon Anggaran Kontrak (Rp)
            </label>
            <Input
              name="contractAmount"
              type="number"
              min={0}
              step={1000000}
              placeholder="150000000"
              value={formData.contractAmount || ""}
              onChange={handleChange}
              disabled={loading}
              className={errors.contractAmount ? "border-destructive" : ""}
            />
            {errors.contractAmount && (
              <span className="text-[11px] text-destructive">
                {errors.contractAmount}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">
              Tier 1 Plafon: Terbuka untuk Sarah & Dimas (Dirahasiakan dari Kru)
            </span>
          </div>
        </div>

        {/* Venue Information */}
        <div className="flex flex-col gap-4 pt-2 border-t border-border/60">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Building className="h-3.5 w-3.5 text-stone-500" />
              <span>Nama Gedung / Venue</span> <span className="text-destructive">*</span>
            </label>
            <Input
              name="venueName"
              placeholder="Contoh: Grand Ballroom Hotel Mulia Senayan"
              value={formData.venueName}
              onChange={handleChange}
              disabled={loading}
              className={errors.venueName ? "border-destructive" : ""}
            />
            {errors.venueName && (
              <span className="text-[11px] text-destructive">
                {errors.venueName}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-stone-500" />
              <span>Alamat Lengkap Venue</span>
            </label>
            <Input
              name="venueAddress"
              placeholder="Contoh: Jl. Asia Afrika No. 1, Gelora, Tanah Abang, Jakarta Pusat"
              value={formData.venueAddress}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="text-xs"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-2"
          >
            <Users className="h-4 w-4" />
            <span>{loading ? "Menyimpan Proyek..." : "Daftarkan & Atur Skuad"}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
}
