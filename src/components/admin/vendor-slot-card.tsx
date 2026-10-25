"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { updateVendorSlotAction, removeVendorFromProjectAction } from "@/actions/vendor-actions";
import { generateVendorTmWhatsappUrl, generateDirectWhatsappUrl } from "@/lib/whatsapp";
import type { ProjectVendorSlotDTO } from "@/services/vendor-service";
import type { ContractStatus } from "@/schemas/vendor-schema";
import { format, parseISO, subDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  MessageSquare,
  ChevronDown,
  Trash2,
  Calendar,
  Building2,
  Loader2,
} from "lucide-react";

interface VendorSlotCardProps {
  slot: ProjectVendorSlotDTO;
  projectInfo: {
    id: string;
    projectName: string;
    weddingDate: string;
    venueName: string;
  };
  canManage: boolean;
  onRefresh?: () => void;
}

const STATUS_CONFIG_MAP: Record<
  string,
  { label: string; badgeClass: string; dotClass: string }
> = {
  INQUIRY: {
    label: "Penjajakan (Inquiry)",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
  },
  BOOKED: {
    label: "Terkonfirmasi Resmi",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
  },
  DP_PAID: {
    label: "DP Terbayar",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dotClass: "bg-indigo-500",
  },
  SETTLED: {
    label: "Lunas (Settled)",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Dibatalkan",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    dotClass: "bg-rose-500",
  },
};

const CATEGORY_LABEL_MAP: Record<string, string> = {
  VENUE: "Venue & Gedung",
  CATERING: "Katering & Makanan",
  DECORATION: "Dekorasi & Florist",
  MUA: "MUA & Tata Rias",
  PHOTO_VIDEO: "Foto & Video",
  SOUND_LIGHTING: "Sound & Lighting",
  MC: "Master of Ceremony",
  ATTIRE: "Busana Pengantin",
  ENTERTAINMENT: "Musik & Entertainment",
  OTHER: "Lain-Lain",
};

export function VendorSlotCard({
  slot,
  projectInfo,
  canManage,
  onRefresh,
}: VendorSlotCardProps) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Hitung perkiraan tanggal TM (H-14 hari sebelum wedding date)
  let formattedTmDate = "Tanggal TM Menyusul";
  try {
    const weddingParsed = parseISO(projectInfo.weddingDate);
    const tmDate = subDays(weddingParsed, 14);
    formattedTmDate = format(tmDate, "EEEE, d MMMM yyyy", { locale: localeId });
  } catch {
    // fallback
  }

  // Generate URL pesan undangan TM otomatis
  const tmWhatsappUrl = generateVendorTmWhatsappUrl({
    vendorPicName: slot.picName,
    vendorName: slot.vendorName,
    clientNames: projectInfo.projectName,
    meetingDate: formattedTmDate,
    meetingTime: "14:00",
    venueName: projectInfo.venueName,
    rawPhone: slot.phone,
  });

  // Direct WA link
  const directWaUrl = generateDirectWhatsappUrl(
    slot.phone,
    `Halo Kak ${slot.picName} (${slot.vendorName}), kami dari tim WO ${projectInfo.projectName}.`
  );

  const statusConfig =
    STATUS_CONFIG_MAP[slot.contractStatus] ?? STATUS_CONFIG_MAP.INQUIRY!;
  const categoryLabel = CATEGORY_LABEL_MAP[slot.category] ?? slot.category;

  const handleStatusChange = async (newStatus: ContractStatus) => {
    if (newStatus === slot.contractStatus) return;
    setUpdating(true);

    try {
      const res = await updateVendorSlotAction({
        slotId: slot.slotId,
        projectId: projectInfo.id,
        contractStatus: newStatus,
      });

      if (!res.success) {
        toast.error(res.error.message);
        return;
      }

      toast.success(`Status ${slot.vendorName} diubah ke ${STATUS_CONFIG_MAP[newStatus]?.label ?? newStatus}`);
      onRefresh?.();
    } catch {
      toast.error("Gagal memperbarui status kontrak vendor.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus ${slot.vendorName} dari daftar vendor proyek ini?`)) return;
    setDeleting(true);

    try {
      const res = await removeVendorFromProjectAction(slot.slotId, projectInfo.id);
      if (!res.success) {
        toast.error(res.error.message);
        return;
      }

      toast.success(`Vendor ${slot.vendorName} berhasil dilepas dari proyek.`);
      onRefresh?.();
    } catch {
      toast.error("Gagal melepaskan vendor.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="p-4 rounded-xl border border-border/80 bg-card shadow-xs flex flex-col justify-between gap-4 transition-all hover:border-border hover:shadow-sm">
      <div className="flex flex-col gap-3">
        {/* Top: Category Tag & Status Dropdown */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-stone-100 text-stone-800 border-border"
          >
            {categoryLabel}
          </Badge>

          {canManage ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={updating}
                  type="button"
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${statusConfig.badgeClass}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
                  <span>{statusConfig.label}</span>
                  {updating ? (
                    <Loader2 className="h-3 w-3 animate-spin ml-0.5" />
                  ) : (
                    <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs min-w-[180px]">
                <DropdownMenuItem onClick={() => handleStatusChange("INQUIRY")}>
                  Penjajakan (Inquiry)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("BOOKED")}>
                  Terkonfirmasi Resmi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("DP_PAID")}>
                  DP Terbayar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("SETTLED")}>
                  Lunas (Settled)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleStatusChange("CANCELLED")}
                  className="text-destructive focus:text-destructive"
                >
                  Dibatalkan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${statusConfig.badgeClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
              <span>{statusConfig.label}</span>
            </span>
          )}
        </div>

        {/* Vendor Name & PIC Info */}
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-sm text-foreground tracking-tight">
            {slot.vendorName}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span className="font-medium text-foreground">{slot.picName}</span>
            <span>•</span>
            <span className="font-mono">{slot.phone}</span>
          </div>
        </div>

        {/* Notes if present */}
        {slot.notes && (
          <div className="p-2 rounded-md bg-muted/40 border border-border/50 text-[11px] text-muted-foreground leading-relaxed">
            {slot.notes}
          </div>
        )}
      </div>

      {/* Card Footer: WhatsApp Actions & Delete */}
      <div className="flex flex-col gap-2 pt-3 border-t border-border/60">
        <div className="flex items-center justify-between gap-2">
          {/* WhatsApp Technical Meeting (TM) Button */}
          <a
            href={tmWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
            title="Kirim Undangan TM WhatsApp"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Kirim Undangan TM</span>
          </a>

          {/* Quick Direct Chat Button */}
          <a
            href={directWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Chat Langsung via WhatsApp"
          >
            <MessageSquare className="h-4 w-4" />
          </a>

          {/* Delete Slot Button */}
          {canManage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Lepas Vendor dari Proyek"
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
