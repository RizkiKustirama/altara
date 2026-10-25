import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { assertProjectAccess } from "@/lib/auth-guard";
import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { projectRundowns } from "@/db/schema/rundowns";
import { sacredBelongings } from "@/db/schema/supporting-phase2";
import { projectCrews } from "@/db/schema/project-crews";
import { users } from "@/db/schema/users";
import { eq, asc } from "drizzle-orm";
import {
  Package,
  PhoneCall,
  CheckCircle2,
  Users as UsersIcon,
  ChevronRight,
  Flame,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface FieldOverviewPageProps {
  params: {
    projectId: string;
  };
}

export default async function FieldOverviewPage({
  params,
}: FieldOverviewPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const access = await assertProjectAccess(session, params.projectId);
  if (!access.success) {
    notFound();
  }

  // Load project overview, rundowns, belongings, and crews
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, params.projectId));

  if (!project) notFound();

  const rundowns = await db
    .select()
    .from(projectRundowns)
    .where(eq(projectRundowns.projectId, params.projectId))
    .orderBy(asc(projectRundowns.orderIndex));

  const belongings = await db
    .select()
    .from(sacredBelongings)
    .where(eq(sacredBelongings.projectId, params.projectId));

  const crews = await db
    .select({
      id: projectCrews.id,
      role: projectCrews.roleInProject,
      fullName: users.fullName,
      phone: users.phone,
    })
    .from(projectCrews)
    .leftJoin(users, eq(projectCrews.userId, users.id))
    .where(eq(projectCrews.projectId, params.projectId));

  // Determine current running session or next session
  const inProgressSession = rundowns.find((r) => r.status === "IN_PROGRESS");
  const nextPendingSession = rundowns.find((r) => r.status === "PENDING");
  const activeSession = inProgressSession || nextPendingSession;
  const completedCount = rundowns.filter((r) => r.status === "COMPLETED").length;

  // Logistics summary
  const notReceivedCount = belongings.filter((b) => b.status === "NOT_RECEIVED").length;
  const withCrewCount = belongings.filter((b) => b.status === "WITH_CREW").length;
  const atStageCount = belongings.filter((b) => b.status === "AT_STAGE").length;

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Live Mission Status Card */}
      <section className="rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 border border-amber-500/30 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-amber-400 tracking-wide uppercase">
              Field Command Mode
            </span>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            {completedCount}/{rundowns.length} Selesai
          </span>
        </div>

        {activeSession ? (
          <div className="mt-3 bg-stone-950/60 rounded-xl p-3 border border-stone-800">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="flex items-center gap-1 font-semibold text-amber-300">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  {inProgressSession ? "Sedang Berlangsung" : "Sesi Berikutnya"}
                </span>
              </span>
              <span className="font-mono text-stone-300">
                {activeSession.startTime.slice(0, 5)} - {activeSession.endTime.slice(0, 5)}
              </span>
            </div>
            <h2 className="text-base font-bold text-stone-100 mt-1">
              {activeSession.title}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
              PIC: {activeSession.picRole || "Seluruh Tim"}
            </p>
          </div>
        ) : (
          <div className="mt-3 bg-stone-950/60 rounded-xl p-3 border border-stone-800 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
            <p className="text-xs text-stone-300 mt-1 font-semibold">
              Semua susunan acara telah selesai.
            </p>
          </div>
        )}

        <Link
          href={`/field/${params.projectId}/rundown`}
          className="mt-3 flex items-center justify-between rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3.5 py-2.5 text-xs font-bold text-amber-400 transition-colors"
        >
          <span>Buka Cue-Sheet Rundown</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </section>

      {/* 2. Quick Metrics Row */}
      <section className="grid grid-cols-2 gap-3">
        {/* Logistics Status Card */}
        <Link
          href={`/field/${params.projectId}/logistics`}
          className="flex flex-col justify-between rounded-2xl bg-stone-800/80 border border-stone-700/60 p-3.5 hover:border-amber-500/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <Package className="h-5 w-5 text-amber-400" />
            {notReceivedCount > 0 ? (
              <span className="flex h-5 items-center px-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                {notReceivedCount} Belum
              </span>
            ) : (
              <span className="flex h-5 items-center px-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                Aman
              </span>
            )}
          </div>
          <div className="mt-2">
            <span className="text-[11px] text-stone-400">Logistik Sakral</span>
            <p className="text-sm font-bold text-stone-100">
              {withCrewCount + atStageCount}/{belongings.length} Terpantau
            </p>
          </div>
        </Link>

        {/* Speed-Dial Contacts */}
        <Link
          href={`/field/${params.projectId}/contacts`}
          className="flex flex-col justify-between rounded-2xl bg-stone-800/80 border border-stone-700/60 p-3.5 hover:border-amber-500/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <PhoneCall className="h-5 w-5 text-blue-400" />
            <span className="text-[10px] font-mono text-stone-400">1-Tap WA</span>
          </div>
          <div className="mt-2">
            <span className="text-[11px] text-stone-400">Speed-Dial Darurat</span>
            <p className="text-sm font-bold text-stone-100">Kontak Cepat</p>
          </div>
        </Link>
      </section>

      {/* 3. Assigned Crews on Duty */}
      <section className="rounded-2xl bg-stone-800/80 border border-stone-700/60 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
          <UsersIcon className="h-4 w-4 text-amber-400" />
          <span>Skuad Kru Bertugas ({crews.length})</span>
        </h3>

        <div className="mt-3 divide-y divide-stone-700/60">
          {crews.length === 0 ? (
            <p className="py-2 text-xs text-stone-500 italic">
              Belum ada kru yang ditugaskan di acara ini.
            </p>
          ) : (
            crews.map((c) => (
              <div
                key={c.id}
                className="py-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-stone-100">
                    {c.fullName || "Kru Altara"}
                  </span>
                  <span className="text-[10px] text-amber-300 font-medium">
                    {c.role.replace(/_/g, " ")}
                  </span>
                </div>

                {c.phone && (
                  <a
                    href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[11px] font-semibold active:scale-95 transition-transform"
                  >
                    <span>WA</span>
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
