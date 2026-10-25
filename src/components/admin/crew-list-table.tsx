"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { removeCrewAction } from "@/actions/crew-actions";
import type { CrewAssignmentDTO } from "@/services/crew-service";
import { Trash2, Phone, Mail, Clock, Users } from "lucide-react";

interface CrewListTableProps {
  projectId: string;
  initialCrews: CrewAssignmentDTO[];
  onCrewChanged?: () => void;
}

const roleLabelMap: Record<string, { label: string; badgeClass: string }> = {
  LEAD_PLANNER: {
    label: "Lead Planner",
    badgeClass: "bg-stone-900 text-stone-50 border-stone-800",
  },
  LO_BRIDE: {
    label: "LO Pengantin Wanita",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
  },
  LO_GROOM: {
    label: "LO Pengantin Pria",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  LO_FAMILY: {
    label: "LO Keluarga",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  RUNNER: {
    label: "Runner",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  LOGISTICS: {
    label: "PIC Logistik",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  CEREMONY_OFFICER: {
    label: "Perwira Adat",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
  },
  USHER: {
    label: "Usher",
    badgeClass: "bg-stone-100 text-stone-800 border-stone-200",
  },
};

export function CrewListTable({
  projectId,
  initialCrews,
  onCrewChanged,
}: CrewListTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRemove = async (assignmentId: string, crewName: string) => {
    if (!confirm(`Hapus penugasan kru ${crewName} dari proyek ini?`)) {
      return;
    }

    setDeletingId(assignmentId);
    try {
      const res = await removeCrewAction({ assignmentId, projectId });
      if (!res.success) {
        toast.error(res.error.message);
        return;
      }
      toast.success(`Penugasan ${crewName} berhasil dihapus.`);
      onCrewChanged?.();
    } catch {
      toast.error("Gagal menghapus penugasan kru.");
    } finally {
      setDeletingId(null);
    }
  };

  if (initialCrews.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center border-border/70 bg-card rounded-xl shadow-xs">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 mb-2">
          <Users className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">
          Belum Ada Kru Bertugas
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
          Gunakan tombol di atas untuk menugaskan kru lapangan tanpa risiko jadwal bentrok.
        </p>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-border/70 overflow-hidden shadow-xs bg-card">
      <Table>
        <TableHeader className="bg-stone-50 text-[11px] uppercase tracking-wider text-muted-foreground">
          <TableRow className="border-b border-border/70">
            <TableHead className="font-semibold text-stone-700">Anggota Kru</TableHead>
            <TableHead className="font-semibold text-stone-700">Kontak Person</TableHead>
            <TableHead className="font-semibold text-stone-700">Peran Lapangan</TableHead>
            <TableHead className="font-semibold text-stone-700">Jam Shift Operasional</TableHead>
            <TableHead className="font-semibold text-stone-700 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs">
          {initialCrews.map((crew) => {
            const roleMeta = roleLabelMap[crew.roleInProject] ?? {
              label: crew.roleInProject,
              badgeClass: "bg-stone-100 text-stone-800 border-stone-200",
            };

            const shiftDisplay =
              crew.shiftStart && crew.shiftEnd
                ? `${crew.shiftStart.slice(0, 5)} - ${crew.shiftEnd.slice(0, 5)} WIB`
                : "Full Shift";

            return (
              <TableRow
                key={crew.assignmentId}
                className="border-b border-border/50 hover:bg-stone-50/50 transition-colors"
              >
                <TableCell className="font-medium text-foreground py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-stone-800 text-xs font-semibold shrink-0">
                      {crew.crewName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {crew.crewName}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Tgl: {crew.eventDate}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-stone-700">
                  <div className="flex flex-col gap-0.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{crew.crewEmail || "-"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{crew.crewPhone || "-"}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0.5 font-medium ${roleMeta.badgeClass}`}
                  >
                    {roleMeta.label}
                  </Badge>
                </TableCell>

                <TableCell className="text-stone-700 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-stone-400" />
                    <span>{shiftDisplay}</span>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(crew.assignmentId, crew.crewName)}
                    disabled={deletingId === crew.assignmentId}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Hapus Penugasan Kru"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
