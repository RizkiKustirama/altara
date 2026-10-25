import Link from "next/link";
import { getProjectsAction } from "@/actions/project-actions";
import { getSession } from "@/lib/auth";
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
import {
  Plus,
  Users,
  MapPin,
  Calendar,
  Briefcase,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await getSession();
  const projectsRes = await getProjectsAction();
  const projects = projectsRes.success ? projectsRes.data : [];

  const statusVariantMap: Record<string, string> = {
    PLANNING: "bg-amber-100 text-amber-800 border-amber-200",
    READY: "bg-blue-100 text-blue-800 border-blue-200",
    IN_PROGRESS: "bg-emerald-100 text-emerald-800 border-emerald-200",
    COMPLETED: "bg-stone-100 text-stone-700 border-stone-200",
    LEAD: "bg-purple-100 text-purple-800 border-purple-200",
    CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
  };

  const statusLabelMap: Record<string, string> = {
    PLANNING: "Planning",
    READY: "Siap Hari-H",
    IN_PROGRESS: "Berlangsung",
    COMPLETED: "Selesai",
    LEAD: "Prospek",
    CANCELLED: "Dibatalkan",
  };

  const canCreate = session?.role === "OWNER" || session?.role === "PLANNER";

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Direktori Proyek Pernikahan
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar lengkap seluruh acara pernikahan pengantin yang sedang ditangani.
          </p>
        </div>

        {canCreate && (
          <Link href="/projects/new">
            <Button size="sm" className="gap-1.5 text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Daftarkan Proyek Baru</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Projects Table Card */}
      <Card className="rounded-xl border border-border/70 overflow-hidden shadow-xs bg-card">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-600 mb-3">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Belum Ada Proyek Pernikahan
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              Mulai dengan mendaftarkan pernikahan pertama untuk menyusun jadwal dan skuad kru.
            </p>
            {canCreate && (
              <Link href="/projects/new">
                <Button size="sm" className="text-xs bg-stone-900 text-stone-50">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Tambah Proyek Baru
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-stone-50 text-[11px] uppercase tracking-wider text-muted-foreground">
              <TableRow className="border-b border-border/70">
                <TableHead className="font-semibold text-stone-700">Nama Acara</TableHead>
                <TableHead className="font-semibold text-stone-700">Pengantin</TableHead>
                <TableHead className="font-semibold text-stone-700">Tanggal Acara</TableHead>
                <TableHead className="font-semibold text-stone-700">Venue</TableHead>
                <TableHead className="font-semibold text-stone-700 text-center">Status</TableHead>
                <TableHead className="font-semibold text-stone-700 text-center">Skuad Kru</TableHead>
                <TableHead className="font-semibold text-stone-700 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {projects.map((project) => {
                const parsedDate = parseISO(project.weddingDate);
                const dateLabel = format(parsedDate, "d MMM yyyy", { locale: localeId });

                return (
                  <TableRow
                    key={project.id}
                    className="border-b border-border/50 hover:bg-stone-50/60 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm line-clamp-1">
                          {project.projectName}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          Token: {project.publicToken}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-stone-700">
                      <span>{project.clientBrideName} & {project.clientGroomName}</span>
                    </TableCell>

                    <TableCell className="text-stone-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-stone-500" />
                        <span>{dateLabel}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-stone-700 max-w-[200px] truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                        <span className="truncate">{project.venueName}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 font-medium ${
                          statusVariantMap[project.status] ?? ""
                        }`}
                      >
                        {statusLabelMap[project.status] ?? project.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-stone-100 text-stone-800 text-[11px] font-medium">
                        <Users className="h-3 w-3 text-stone-500" />
                        <span>{project.crewCount} Kru</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/projects/${project.id}/squad`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1 border-border/80"
                          >
                            <Users className="h-3.5 w-3.5 text-primary" />
                            <span>Skuad Kru</span>
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
