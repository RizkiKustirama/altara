import React from "react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { assertProjectAccess } from "@/lib/auth-guard";
import { getSacredBelongings } from "@/services/logistics-service";
import { db } from "@/db";
import { projectCrews } from "@/db/schema/project-crews";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { LogisticsClient } from "@/components/mobile/logistics-client";

export const dynamic = "force-dynamic";

interface FieldLogisticsPageProps {
  params: {
    projectId: string;
  };
}

export default async function FieldLogisticsPage({
  params,
}: FieldLogisticsPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const access = await assertProjectAccess(session, params.projectId);
  if (!access.success) {
    notFound();
  }

  const [belongings, crews] = await Promise.all([
    getSacredBelongings(params.projectId),
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        role: projectCrews.roleInProject,
      })
      .from(projectCrews)
      .innerJoin(users, eq(projectCrews.userId, users.id))
      .where(eq(projectCrews.projectId, params.projectId)),
  ]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-base font-bold text-stone-100 tracking-tight">
            Pelacak Barang Sakral
          </h2>
          <p className="text-xs text-stone-400">
            Pengawasan ketat posisi fisik cincin, mahar, gaun, dan buku nikah.
          </p>
        </div>
      </div>

      <LogisticsClient
        projectId={params.projectId}
        initialItems={belongings}
        crews={crews}
      />
    </div>
  );
}
