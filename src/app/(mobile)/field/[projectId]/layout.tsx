import React from "react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { assertProjectAccess } from "@/lib/auth-guard";
import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { projectCrews } from "@/db/schema/project-crews";
import { projectRundowns } from "@/db/schema/rundowns";
import { sacredBelongings } from "@/db/schema/supporting-phase2";
import { eq, and, ne } from "drizzle-orm";
import { BottomTabBar } from "@/components/mobile/bottom-tab-bar";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Calendar, MapPin, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

interface MobileFieldLayoutProps {
  children: React.ReactNode;
  params: {
    projectId: string;
  };
}

export default async function MobileFieldLayout({
  children,
  params,
}: MobileFieldLayoutProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const access = await assertProjectAccess(session, params.projectId);
  if (!access.success) {
    notFound();
  }

  // Fetch project basic details
  const [project] = await db
    .select({
      id: projects.id,
      projectName: projects.projectName,
      weddingDate: projects.weddingDate,
      venueName: projects.venueName,
      leadPlannerId: projects.leadPlannerId,
    })
    .from(projects)
    .where(eq(projects.id, params.projectId));

  if (!project) {
    notFound();
  }

  // Find user's specific role on this project
  let crewRole = session.role as string;
  if (project.leadPlannerId === session.userId) {
    crewRole = "LEAD_PLANNER";
  } else {
    const [assignedCrew] = await db
      .select({ roleInProject: projectCrews.roleInProject })
      .from(projectCrews)
      .where(
        and(
          eq(projectCrews.projectId, params.projectId),
          eq(projectCrews.userId, session.userId)
        )
      );

    if (assignedCrew?.roleInProject) {
      crewRole = assignedCrew.roleInProject;
    }
  }

  // Calculate live badge counts
  const [runningRundown] = await db
    .select({ id: projectRundowns.id })
    .from(projectRundowns)
    .where(
      and(
        eq(projectRundowns.projectId, params.projectId),
        eq(projectRundowns.status, "IN_PROGRESS")
      )
    );

  const pendingLogistics = await db
    .select({ id: sacredBelongings.id })
    .from(sacredBelongings)
    .where(
      and(
        eq(sacredBelongings.projectId, params.projectId),
        ne(sacredBelongings.status, "RETURNED_TO_FAMILY")
      )
    );

  let formattedDate = project.weddingDate;
  try {
    const parsed = parseISO(project.weddingDate);
    formattedDate = format(parsed, "EEE, d MMM yyyy", { locale: localeId });
  } catch {
    // fallback
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col truncate pr-2">
            <h1 className="text-sm font-bold text-stone-100 truncate tracking-tight">
              {project.projectName}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5 truncate">
              <span className="flex items-center gap-1 shrink-0">
                <Calendar className="h-3 w-3 text-amber-500" />
                <span>{formattedDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 text-stone-500 shrink-0" />
                <span className="truncate">{project.venueName}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 bg-stone-800/80 border border-stone-700/60 rounded-full px-2.5 py-1">
            <Shield className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
              {crewRole.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <div className="flex-1 p-4 pb-24 overflow-y-auto">{children}</div>

      {/* Bottom Tab Bar */}
      <BottomTabBar
        projectId={params.projectId}
        badgeCounts={{
          runningSessions: runningRundown ? 1 : 0,
          pendingLogistics: pendingLogistics.length,
        }}
      />
    </div>
  );
}
