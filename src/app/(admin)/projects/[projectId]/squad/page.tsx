import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectOverviewAction } from "@/actions/project-actions";
import { getProjectCrewsAction } from "@/actions/crew-actions";
import { CrewAssignmentDrawer } from "@/components/admin/crew-assignment-drawer";
import { CrewListTable } from "@/components/admin/crew-list-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Users,
  ShieldCheck,
  Building,
  Clock,
  Wallet,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

export const dynamic = "force-dynamic";

interface SquadPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectSquadPage({ params }: SquadPageProps) {
  const [projectRes, crewsRes] = await Promise.all([
    getProjectOverviewAction(params.projectId),
    getProjectCrewsAction(params.projectId),
  ]);

  if (!projectRes.success) {
    notFound();
  }

  const project = projectRes.data;
  const crews = crewsRes.success ? crewsRes.data : [];

  const parsedDate = parseISO(project.weddingDate);
  const formattedDate = format(parsedDate, "EEEE, d MMMM yyyy", { locale: localeId });

  return (
    <div className="flex flex-col gap-6">
      {/* Back button & Breadcrumb */}
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
        <span className="text-foreground font-medium">Alokasi Skuad</span>
      </div>

      {/* Project Overview Header Card */}
      <Card className="p-6 rounded-xl border border-border/70 bg-card shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {project.projectName}
              </h1>
              <Badge variant="outline" className="text-xs px-2 py-0.5 bg-stone-100 text-stone-800 border-border">
                {project.status}
              </Badge>
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
              {project.contractAmount !== undefined && (
                <div className="flex items-center gap-1 font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                  <span>Plafon: Rp {project.contractAmount.toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Header Action: Add Crew via Slide-Over Sheet */}
          <div className="flex items-center gap-3">
            <CrewAssignmentDrawer
              projectId={project.id}
              weddingDate={project.weddingDate}
              projectName={project.projectName}
            />
          </div>
        </div>

        {/* Public Token Info Banner */}
        <div className="mt-4 pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Tautan Portal Tamu & Pengantin Publik (Tanpa Login):</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="px-2 py-1 rounded bg-stone-100 text-stone-800 font-mono text-[11px] border border-border/60">
              /portal/{project.publicToken}
            </code>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 border-t border-border/60 mt-4">
          <Button
            variant="default"
            size="sm"
            className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Skuad & Kru ({crews.length})</span>
          </Button>

          <Link href={`/projects/${project.id}/vendors`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Building className="h-3.5 w-3.5" />
              <span>Rekanan Vendor ({project.vendorCount})</span>
            </Button>
          </Link>

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

          <Link href={`/projects/${project.id}/budget`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Bujet Operasional</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Squad Table Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Daftar Skuad Kru Terpasang ({crews.length} Anggota)</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Setiap penugasan telah diverifikasi melalui Mesin Anti-Bentrok agar kru tidak bertugas ganda di hari yang sama.
            </p>
          </div>
        </div>

        <CrewListTable
          projectId={project.id}
          initialCrews={crews}
        />
      </div>
    </div>
  );
}
