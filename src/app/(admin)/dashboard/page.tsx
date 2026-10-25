import { getProjectsAction } from "@/actions/project-actions";
import { CalendarGrid } from "@/components/admin/calendar-grid";
import { Card } from "@/components/ui/card";
import { Briefcase, Users, CalendarDays, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const projectsRes = await getProjectsAction();
  const projects = projectsRes.success ? projectsRes.data : [];

  const activeProjects = projects.filter(
    (p) => p.status === "PLANNING" || p.status === "READY" || p.status === "IN_PROGRESS"
  );

  const totalCrewAssigned = projects.reduce((acc, curr) => acc + curr.crewCount, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Quick Context */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard Operasional
          </h1>
          <p className="text-xs text-muted-foreground">
            Pemantauan jadwal pernikahan, kesiapan venue, dan penugasan skuad kru.
          </p>
        </div>
      </div>

      {/* Metrics Row (Operate Mode - Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between border-border/70 shadow-xs bg-card">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Proyek Aktif
            </span>
            <span className="text-2xl font-bold text-foreground mt-1">
              {activeProjects.length}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              Dari total {projects.length} pernikahan tercatat
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-900">
            <Briefcase className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-border/70 shadow-xs bg-card">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Kru Bertugas
            </span>
            <span className="text-2xl font-bold text-foreground mt-1">
              {totalCrewAssigned}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              Total penugasan aktif di seluruh acara
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
            <Users className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-border/70 shadow-xs bg-card">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Integritas Sistem
            </span>
            <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Anti-Bentrok Aktif</span>
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              Validasi 2 lapis melindungi jadwal kru
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
            <CalendarDays className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Multi-Event Operational Calendar Grid */}
      <CalendarGrid projects={projects} />
    </div>
  );
}
