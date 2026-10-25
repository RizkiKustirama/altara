import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { assertRole } from "@/lib/auth-guard";
import { getAllCrewPayouts } from "@/services/payout-service";
import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { users } from "@/db/schema/users";
import { BatchPayoutTable } from "@/components/admin/batch-payout-table";
import { PayoutHeaderClient } from "@/components/admin/payout-header-client";
import { desc, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const auth = assertRole(session, ["OWNER", "MANAGEMENT"]);
  if (!auth.success) {
    redirect("/dashboard");
  }

  const [payouts, allProjects, allCrews] = await Promise.all([
    getAllCrewPayouts(),
    db
      .select({ id: projects.id, projectName: projects.projectName })
      .from(projects)
      .orderBy(desc(projects.createdAt)),
    db
      .select({ id: users.id, fullName: users.fullName })
      .from(users)
      .orderBy(asc(users.fullName)),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar with Action */}
      <PayoutHeaderClient
        projects={allProjects}
        crews={allCrews}
      />

      {/* Payouts Table */}
      <BatchPayoutTable
        initialPayouts={payouts}
        canExecute={true}
      />
    </div>
  );
}
