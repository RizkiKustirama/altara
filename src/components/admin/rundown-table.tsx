"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MusicCueBadge,
  LightingCueBadge,
  PicRoleBadge,
  RundownStatusBadge,
} from "./cue-sheet-badges";
import type { ProjectRundown } from "@/db/schema/rundowns";
import { calculateDurationMinutes } from "@/lib/rundown-time";
import {
  MoreHorizontal,
  Pencil,
  FastForward,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { updateRundownItemAction, deleteRundownItemAction } from "@/actions/rundown-actions";
import { toast } from "sonner";

interface RundownTableProps {
  projectId: string;
  items: ProjectRundown[];
  canManage: boolean;
  onEditItem: (item: ProjectRundown) => void;
  onShiftFromItem: (item: ProjectRundown) => void;
  onRefresh: () => void;
}

export function RundownTable({
  projectId,
  items,
  canManage,
  onEditItem,
  onShiftFromItem,
  onRefresh,
}: RundownTableProps) {
  const handleQuickStatusChange = async (
    itemId: string,
    newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED"
  ) => {
    try {
      const res = await updateRundownItemAction({
        itemId,
        projectId,
        status: newStatus,
        propagateRemaining: false,
      });

      if (res.success) {
        toast.success(`Status diubah ke ${newStatus}`);
        onRefresh();
      } else {
        toast.error(res.error?.message ?? "Gagal memperbarui status");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleDelete = async (itemId: string, title: string) => {
    if (!confirm(`Hapus agenda "${title}" dari susunan acara?`)) return;

    try {
      const res = await deleteRundownItemAction({
        itemId,
        projectId,
      });

      if (res.success) {
        toast.success(`Agenda "${title}" berhasil dihapus`);
        onRefresh();
      } else {
        toast.error(res.error?.message ?? "Gagal menghapus agenda");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-border bg-stone-50/50">
        <div className="p-3 rounded-full bg-stone-100 text-stone-500 mb-3">
          <Clock className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Belum ada susunan acara (rundown)
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Gunakan tombol &quot;Terapkan Template&quot; di atas untuk menyalin paket adat Sunda/Jawa/Holy Matrimony otomatis, atau tambahkan agenda secara manual.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
      <Table className="text-xs">
        <TableHeader className="bg-stone-50/80 border-b border-border/70">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px] font-mono text-[11px] text-stone-600">No</TableHead>
            <TableHead className="w-[170px] font-medium text-stone-700">Waktu & Durasi</TableHead>
            <TableHead className="min-w-[240px] font-medium text-stone-700">Sesi & Detail Instruksi</TableHead>
            <TableHead className="w-[180px] font-medium text-stone-700">Cue Sheet (Audio & Light)</TableHead>
            <TableHead className="w-[140px] font-medium text-stone-700">PIC Pelaksana</TableHead>
            <TableHead className="w-[130px] font-medium text-stone-700">Status</TableHead>
            {canManage && <TableHead className="w-[60px] text-right font-medium">Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/60">
          {items.map((item, index) => {
            const startHhMm = item.startTime.slice(0, 5);
            const endHhMm = item.endTime.slice(0, 5);
            const duration = calculateDurationMinutes(item.startTime, item.endTime);

            return (
              <TableRow
                key={item.id}
                className={`transition-colors ${
                  item.status === "IN_PROGRESS"
                    ? "bg-blue-50/40 hover:bg-blue-50/60"
                    : item.status === "COMPLETED"
                    ? "bg-stone-50/30 opacity-80 hover:opacity-100"
                    : "hover:bg-stone-50/60"
                }`}
              >
                {/* Order Index */}
                <TableCell className="font-mono text-stone-400 font-medium py-3">
                  {String(index + 1).padStart(2, "0")}
                </TableCell>

                {/* Time & Duration */}
                <TableCell className="py-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-stone-900 tracking-tight">
                      <span>{startHhMm}</span>
                      <span className="text-stone-400">-</span>
                      <span>{endHhMm}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block px-1.5 py-0.2 rounded bg-stone-100 border border-stone-200/80 text-[10px] font-mono text-stone-600">
                        {duration}m
                      </span>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => onShiftFromItem(item)}
                          title="Geser waktu mulai dari sesi ini"
                          className="text-[10px] text-amber-600 hover:text-amber-800 hover:underline flex items-center gap-0.5 ml-1"
                        >
                          <FastForward className="h-2.5 w-2.5" />
                          <span>Shift</span>
                        </button>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Title & Description */}
                <TableCell className="py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground text-xs leading-snug">
                      {item.title}
                    </span>
                    {item.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Cue Sheet: Audio & Lighting */}
                <TableCell className="py-3">
                  <div className="flex flex-col gap-1.5 items-start">
                    {item.musicCue && <MusicCueBadge cue={item.musicCue} />}
                    {item.lightingCue && <LightingCueBadge cue={item.lightingCue} />}
                    {!item.musicCue && !item.lightingCue && (
                      <span className="text-[11px] text-stone-400 italic">-</span>
                    )}
                  </div>
                </TableCell>

                {/* PIC Role */}
                <TableCell className="py-3">
                  <PicRoleBadge role={item.picRole} />
                </TableCell>

                {/* Status with Quick Toggle Dropdown */}
                <TableCell className="py-3">
                  {canManage ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="outline-none focus:ring-1 focus:ring-ring rounded-md transition-opacity hover:opacity-80 text-left"
                        >
                          <RundownStatusBadge status={item.status} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="text-xs">
                        <DropdownMenuLabel className="text-[10px] text-muted-foreground">
                          Ganti Status Sesi
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleQuickStatusChange(item.id, "PENDING")}
                          className="gap-2"
                        >
                          <Clock className="h-3.5 w-3.5 text-stone-400" />
                          <span>Menunggu (Pending)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleQuickStatusChange(item.id, "IN_PROGRESS")}
                          className="gap-2 text-blue-600"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Sedang Berjalan</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleQuickStatusChange(item.id, "COMPLETED")}
                          className="gap-2 text-emerald-600"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Selesai (Completed)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleQuickStatusChange(item.id, "DELAYED")}
                          className="gap-2 text-rose-600"
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Terlambat (Delayed)</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <RundownStatusBadge status={item.status} />
                  )}
                </TableCell>

                {/* Row Actions */}
                {canManage && (
                  <TableCell className="py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-stone-500 hover:text-stone-900"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Aksi</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs w-44">
                        <DropdownMenuItem
                          onClick={() => onEditItem(item)}
                          className="gap-2"
                        >
                          <Pencil className="h-3.5 w-3.5 text-stone-500" />
                          <span>Edit Detail & Waktu</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onShiftFromItem(item)}
                          className="gap-2 text-amber-600"
                        >
                          <FastForward className="h-3.5 w-3.5" />
                          <span>Geser Jadwal Dari Sini</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(item.id, item.title)}
                          className="gap-2 text-rose-600 focus:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus Agenda</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
