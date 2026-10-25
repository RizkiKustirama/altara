"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VendorSlotCard } from "@/components/admin/vendor-slot-card";
import { VendorSlotDialog } from "@/components/admin/vendor-slot-dialog";
import type { ProjectVendorSlotDTO, VendorDTO } from "@/services/vendor-service";
import {
  Building2,
  Plus,
  Users,
  Calendar,
  ArrowLeft,
  Building,
  Clock,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface ProjectVendorsClientProps {
  project: {
    id: string;
    projectName: string;
    weddingDate: string;
    venueName: string;
    status: string;
    leadPlannerName?: string | null;
  };
  initialSlots: ProjectVendorSlotDTO[];
  masterVendors: VendorDTO[];
  canManage: boolean;
}

export function ProjectVendorsClient({
  project,
  initialSlots,
  masterVendors,
  canManage,
}: ProjectVendorsClientProps) {
  const router = useRouter();
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);

  let formattedDate = project.weddingDate;
  try {
    const parsed = parseISO(project.weddingDate);
    formattedDate = format(parsed, "EEEE, d MMMM yyyy", { locale: localeId });
  } catch {
    // fallback
  }

  const confirmedCount = initialSlots.filter(
    (s) => s.contractStatus === "BOOKED" || s.contractStatus === "DP_PAID" || s.contractStatus === "SETTLED"
  ).length;

  const settledCount = initialSlots.filter((s) => s.contractStatus === "SETTLED").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/projects" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Daftar Proyek</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">
          {project.projectName}
        </span>
        <span>/</span>
        <span className="text-foreground font-medium">Rekanan Vendor</span>
      </div>

      {/* Project Header Card */}
      <Card className="p-6 rounded-xl border border-border/70 bg-card shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {project.projectName}
              </h1>
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 bg-stone-100 text-stone-800 border-border"
              >
                {project.status}
              </Badge>
              {project.leadPlannerName && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                >
                  PM: {project.leadPlannerName}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-stone-700">
                <Calendar className="h-4 w-4 text-stone-500" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building className="h-4 w-4 text-stone-500" />
                <span>{project.venueName}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 bg-muted/30 border border-border/60 p-3 rounded-xl">
            <div className="flex flex-col px-2">
              <span className="text-[11px] text-muted-foreground">Total Vendor</span>
              <span className="text-base font-bold text-foreground">
                {initialSlots.length}
              </span>
            </div>
            <div className="h-7 w-[1px] bg-border/80" />
            <div className="flex flex-col px-2">
              <span className="text-[11px] text-muted-foreground">Terkonfirmasi</span>
              <span className="text-base font-bold text-blue-600">
                {confirmedCount}
              </span>
            </div>
            <div className="h-7 w-[1px] bg-border/80" />
            <div className="flex flex-col px-2">
              <span className="text-[11px] text-muted-foreground">Lunas 100%</span>
              <span className="text-base font-bold text-emerald-600">
                {settledCount}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 pt-6 border-t border-border/60 mt-6">
          <Link href={`/projects/${project.id}/squad`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Skuad & Kru</span>
            </Button>
          </Link>

          <Button
            variant="default"
            size="sm"
            className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Rekanan Vendor ({initialSlots.length})</span>
          </Button>

          <Link href={`/projects/${project.id}/rundown`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Susunan Acara</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Slotting Kebutuhan Vendor Acara
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar rekanan yang menangani gedung, katering, tata rias, dokumentasi, hingga musik.
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => setSlotDialogOpen(true)}
            size="sm"
            className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Pasangkan Rekanan Vendor</span>
          </Button>
        )}
      </div>

      {/* Grid Slotting Vendor */}
      {initialSlots.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Belum Ada Rekanan Vendor yang Dipasangkan
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Pasangkan vendor resmi dari master katalog untuk memulai koordinasi Technical Meeting (TM) dan memantau status pembayaran.
          </p>
          {canManage && (
            <Button
              onClick={() => setSlotDialogOpen(true)}
              variant="outline"
              size="sm"
              className="mt-4 text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Pasangkan Vendor Sekarang</span>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialSlots.map((slot) => (
            <VendorSlotCard
              key={slot.slotId}
              slot={slot}
              projectInfo={{
                id: project.id,
                projectName: project.projectName,
                weddingDate: project.weddingDate,
                venueName: project.venueName,
              }}
              canManage={canManage}
              onRefresh={() => {
                router.refresh();
              }}
            />
          ))}
        </div>
      )}

      {/* Slotting Dialog */}
      <VendorSlotDialog
        open={slotDialogOpen}
        onOpenChange={setSlotDialogOpen}
        projectId={project.id}
        masterVendors={masterVendors}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
