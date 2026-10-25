"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  assignCrewAction,
  getAvailableCrewUsersAction,
  type CrewUserAvailabilityDTO,
} from "@/actions/crew-actions";
import {
  UserPlus,
  AlertTriangle,
  Clock,
  Briefcase,
  CheckCircle2,
} from "lucide-react";

interface CrewAssignmentDrawerProps {
  projectId: string;
  weddingDate: string;
  projectName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const CREW_ROLES = [
  { value: "LEAD_PLANNER", label: "Lead Planner (Penanggung Jawab Acara)" },
  { value: "LO_BRIDE", label: "LO Pengantin Wanita (Bride)" },
  { value: "LO_GROOM", label: "LO Pengantin Pria (Groom)" },
  { value: "LO_FAMILY", label: "LO Keluarga & Orang Tua" },
  { value: "RUNNER", label: "Runner Lapangan (Operasional)" },
  { value: "LOGISTICS", label: "PIC Logistik & Perlengkapan Sakral" },
  { value: "CEREMONY_OFFICER", label: "Perwira Prosesi Adat / Ijab" },
  { value: "USHER", label: "Usher / Penerima Buku Tamu" },
];

export function CrewAssignmentDrawer({
  projectId,
  weddingDate,
  projectName,
  onSuccess,
  trigger,
}: CrewAssignmentDrawerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingAvailability, setFetchingAvailability] = useState(false);
  const [crewUsers, setCrewUsers] = useState<CrewUserAvailabilityDTO[]>([]);
  const [conflictAlert, setConflictAlert] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    userId: "",
    roleInProject: "LEAD_PLANNER",
    shiftStart: "06:00",
    shiftEnd: "15:00",
  });

  const loadCrewAvailability = async () => {
    setFetchingAvailability(true);
    setConflictAlert(null);
    try {
      const res = await getAvailableCrewUsersAction(weddingDate, projectId);
      if (res.success) {
        setCrewUsers(res.data);
        if (res.data.length > 0 && !formData.userId) {
          setFormData((prev) => ({ ...prev, userId: res.data[0]?.userId ?? "" }));
        }
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("Gagal memeriksa ketersediaan jadwal staf.");
    } finally {
      setFetchingAvailability(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadCrewAvailability();
    }
  }, [open, weddingDate, projectId]);

  const selectedUser = crewUsers.find((u) => u.userId === formData.userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setConflictAlert(null);

    if (!formData.userId) {
      toast.error("Silakan pilih anggota kru.");
      setLoading(false);
      return;
    }

    try {
      const result = await assignCrewAction({
        projectId,
        userId: formData.userId,
        roleInProject: formData.roleInProject,
        shiftStart: formData.shiftStart,
        shiftEnd: formData.shiftEnd,
      });

      if (!result.success) {
        if (result.error.code === "CONFLICT_SCHEDULE") {
          setConflictAlert(result.error.message);
          toast.error(result.error.message, {
            duration: 6000,
          });
        } else {
          toast.error(result.error.message);
        }
        setLoading(false);
        return;
      }

      toast.success(
        `Kru ${result.data.crewName} berhasil ditugaskan ke ${projectName}!`
      );
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error("Terjadi kegagalan komunikasi sistem saat menugaskan kru.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5 text-xs bg-stone-900 text-stone-50 hover:bg-stone-800">
            <UserPlus className="h-3.5 w-3.5" />
            <span>Tugaskan Kru Baru</span>
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-6 bg-card overflow-y-auto">
        <SheetHeader className="text-left pb-4 border-b border-border/70">
          <SheetTitle className="text-base font-semibold text-foreground">
            Alokasi Skuad Kru Pernikahan
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground mt-1">
            Penugasan staf lapangan untuk <span className="font-semibold text-foreground">{projectName}</span> pada tanggal{" "}
            <span className="font-semibold text-foreground">{weddingDate}</span>.
          </SheetDescription>
        </SheetHeader>

        {/* Anti-Conflict Warning Box */}
        {conflictAlert && (
          <div className="mt-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Peringatan Jadwal Bentrok!</span>
              <span>{conflictAlert}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4 flex-1">
          {/* Crew Staff Selection */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Pilih Anggota Kru / Staf
              </label>
              <span className="text-[10px] text-muted-foreground">
                {fetchingAvailability ? "Memeriksa bentrok..." : `${crewUsers.length} staf aktif`}
              </span>
            </div>

            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              disabled={loading || fetchingAvailability}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            >
              {crewUsers.map((u) => (
                <option key={u.userId} value={u.userId} className="text-xs bg-card">
                  {u.fullName} ({u.role}) — {u.isAvailable ? "🟢 Tersedia" : `🔴 Bentrok: ${u.bookedProjectName}`}
                </option>
              ))}
            </select>

            {/* Selected User Status Badge */}
            {selectedUser && (
              <div className="flex items-center justify-between mt-1 px-2.5 py-1.5 rounded-md bg-stone-50 border border-border/60 text-xs">
                <span className="text-muted-foreground">Status Ketersediaan:</span>
                {selectedUser.isAvailable ? (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Bebas Tugas di Tanggal Ini</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-300 gap-1 font-semibold">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Bentrok di {selectedUser.bookedProjectName}</span>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Role in Project Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-stone-500" />
              <span>Peran Penugasan Lapangan</span>
            </label>
            <select
              value={formData.roleInProject}
              onChange={(e) => setFormData({ ...formData, roleInProject: e.target.value })}
              disabled={loading}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            >
              {CREW_ROLES.map((r) => (
                <option key={r.value} value={r.value} className="text-xs bg-card">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-stone-500" />
                <span>Jam Mulai Shift</span>
              </label>
              <Input
                type="time"
                value={formData.shiftStart}
                onChange={(e) => setFormData({ ...formData, shiftStart: e.target.value })}
                disabled={loading}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-stone-500" />
                <span>Jam Selesai Shift</span>
              </label>
              <Input
                type="time"
                value={formData.shiftEnd}
                onChange={(e) => setFormData({ ...formData, shiftEnd: e.target.value })}
                disabled={loading}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-border/70 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || fetchingAvailability}
              className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{loading ? "Menugaskan..." : "Konfirmasi Penugasan"}</span>
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
