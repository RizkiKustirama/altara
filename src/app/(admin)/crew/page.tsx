import { redirect } from "next/navigation";
import { Users, UserCheck, ShieldCheck, Briefcase } from "lucide-react";
import { getSession } from "@/lib/auth";
import { assertRole } from "@/lib/auth-guard";
import { getCrewDirectory } from "@/services/crew-service";
import { CrewDirectoryTable } from "@/components/admin/crew-directory-table";
import { CrewCreateDialog } from "@/components/admin/crew-create-dialog";

export const dynamic = "force-dynamic";

export default async function CrewDirectoryPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const auth = assertRole(session, ["OWNER", "MANAGEMENT", "CREW"]);
  if (!auth.success) {
    redirect("/dashboard");
  }

  const canManageCrew = session.role === "OWNER" || session.role === "MANAGEMENT";

  const res = await getCrewDirectory();
  const crews = res.success ? res.data : [];

  const totalMembers = crews.length;
  const leadPlanners = crews.filter((c) => c.role === "CREW").length;
  const managers = crews.filter((c) => c.role === "MANAGEMENT" || c.role === "OWNER").length;
  const totalAssignments = crews.reduce((acc, c) => acc + c.totalAssignments, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="h-6 w-6 text-stone-700" />
            Direktori Master Kru & Tim Skuad
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Daftar lengkap staf perencana (PM), tim manajemen, dan kru operasional lapangan Altara Studio.
          </p>
        </div>

        {canManageCrew && <CrewCreateDialog />}
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {totalMembers}
            </div>
            <div className="text-xs text-muted-foreground">Total Anggota Tim</div>
          </div>
        </div>

        {/* Lead Planners / Field Crew */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {leadPlanners}
            </div>
            <div className="text-xs text-muted-foreground">Staf Kru & Planner</div>
          </div>
        </div>

        {/* Management & Executives */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {managers}
            </div>
            <div className="text-xs text-muted-foreground">Owner & Manajemen</div>
          </div>
        </div>

        {/* Total Assignments */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {totalAssignments}
            </div>
            <div className="text-xs text-muted-foreground">Akumulasi Penugasan</div>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <CrewDirectoryTable crews={crews} />
    </div>
  );
}
