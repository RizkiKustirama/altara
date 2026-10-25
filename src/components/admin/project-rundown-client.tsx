"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RundownTable } from "./rundown-table";
import { ApplyTemplateDialog } from "./apply-template-dialog";
import { ShiftTimeDialog } from "./shift-time-dialog";
import { RundownItemDialog } from "./rundown-item-dialog";
import type { ProjectRundown, EventTemplate } from "@/db/schema/rundowns";
import { calculateDurationMinutes } from "@/lib/rundown-time";
import {
  ArrowLeft,
  Calendar,
  Building,
  Users,
  Building2,
  Clock,
  Sparkles,
  FastForward,
  Plus,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface ProjectRundownClientProps {
  project: {
    id: string;
    projectName: string;
    weddingDate: string;
    venueName: string;
    status: string;
    leadPlannerId?: string | null;
    leadPlannerName?: string | null;
  };
  initialItems: ProjectRundown[];
  templates: (EventTemplate & { itemCount: number })[];
  canManage: boolean;
}

export function ProjectRundownClient({
  project,
  initialItems,
  templates,
  canManage,
}: ProjectRundownClientProps) {
  const router = useRouter();

  const [items, setItems] = useState<ProjectRundown[]>(initialItems);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [shiftInitialIndex, setShiftInitialIndex] = useState(0);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectRundown | null>(null);

  // Sync state if props change
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  let formattedDate = project.weddingDate;
  try {
    const parsed = parseISO(project.weddingDate);
    formattedDate = format(parsed, "EEEE, d MMMM yyyy", { locale: localeId });
  } catch {
    // fallback
  }

  // Calculate total duration across all sessions
  const totalMinutes = items.reduce((acc, curr) => {
    return acc + calculateDurationMinutes(curr.startTime, curr.endTime);
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  const completedCount = items.filter((it) => it.status === "COMPLETED").length;
  const inProgressItem = items.find((it) => it.status === "IN_PROGRESS");

  const handleEditItem = (item: ProjectRundown) => {
    setEditingItem(item);
    setItemDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setItemDialogOpen(true);
  };

  const handleShiftFromItem = (item: ProjectRundown) => {
    setShiftInitialIndex(item.orderIndex);
    setShiftDialogOpen(true);
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const lastItem = items[items.length - 1];
  const nextStartTime = lastItem ? lastItem.endTime.slice(0, 5) : "08:00";

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
        <span className="text-foreground font-medium">Susunan Acara</span>
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
              <span className="text-[11px] text-muted-foreground">Total Sesi</span>
              <span className="text-base font-bold text-foreground">
                {items.length}
              </span>
            </div>
            <div className="h-7 w-[1px] bg-border/80" />
            <div className="flex flex-col px-2">
              <span className="text-[11px] text-muted-foreground">Total Durasi</span>
              <span className="text-base font-bold text-stone-800 font-mono">
                {totalHours > 0 ? `${totalHours}j ${remainingMins}m` : `${remainingMins}m`}
              </span>
            </div>
            <div className="h-7 w-[1px] bg-border/80" />
            <div className="flex flex-col px-2">
              <span className="text-[11px] text-muted-foreground">Progres Hari-H</span>
              <span className="text-base font-bold text-emerald-600">
                {completedCount}/{items.length} Selesai
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

          <Link href={`/projects/${project.id}/vendors`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Rekanan Vendor</span>
            </Button>
          </Link>

          <Button
            variant="default"
            size="sm"
            className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Susunan Acara ({items.length})</span>
          </Button>
        </div>
      </Card>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {inProgressItem ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 text-blue-800 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span>
                Sedang Berlangsung: <strong className="font-semibold">{inProgressItem.title}</strong> ({inProgressItem.startTime.slice(0, 5)} - {inProgressItem.endTime.slice(0, 5)})
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              Susunan menit-per-menit (cue sheet) teknis kru dan pengisi acara.
            </span>
          )}
        </div>

        {canManage && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setApplyDialogOpen(true)}
              className="text-xs gap-1.5 text-stone-700 hover:text-stone-900"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Terapkan Template</span>
            </Button>

            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShiftInitialIndex(0);
                  setShiftDialogOpen(true);
                }}
                className="text-xs gap-1.5 text-amber-700 hover:text-amber-900 border-amber-200 bg-amber-50/40 hover:bg-amber-50"
              >
                <FastForward className="h-3.5 w-3.5 text-amber-600" />
                <span>Geser Jadwal (Shift Delay)</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleCreateNew}
              className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Agenda</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Rundown Table */}
      <RundownTable
        projectId={project.id}
        items={items}
        canManage={canManage}
        onEditItem={handleEditItem}
        onShiftFromItem={handleShiftFromItem}
        onRefresh={handleRefresh}
      />

      {/* Modals & Drawers */}
      <ApplyTemplateDialog
        projectId={project.id}
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        templates={templates}
        onSuccess={handleRefresh}
      />

      <ShiftTimeDialog
        projectId={project.id}
        open={shiftDialogOpen}
        onOpenChange={setShiftDialogOpen}
        items={items}
        initialItemIndex={shiftInitialIndex}
        onSuccess={handleRefresh}
      />

      <RundownItemDialog
        projectId={project.id}
        item={editingItem}
        defaultStartTime={nextStartTime}
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
