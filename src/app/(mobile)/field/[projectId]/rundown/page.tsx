import React from "react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { assertProjectAccess } from "@/lib/auth-guard";
import { getProjectRundowns } from "@/services/rundown-service";
import { RundownListClient } from "@/components/mobile/rundown-list-client";

export const dynamic = "force-dynamic";

interface FieldRundownPageProps {
  params: {
    projectId: string;
  };
}

export default async function FieldRundownPage({
  params,
}: FieldRundownPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const access = await assertProjectAccess(session, params.projectId);
  if (!access.success) {
    notFound();
  }

  const items = await getProjectRundowns(params.projectId);

  // All assigned crews, leads, and owners can update rundown status on the field
  const canUpdateStatus = true;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-base font-bold text-stone-100 tracking-tight">
            Susunan Acara Hari-H
          </h2>
          <p className="text-xs text-stone-400">
            Cue-sheet lapangan dengan status sesi aktif & kontrol instan.
          </p>
        </div>
      </div>

      <RundownListClient
        projectId={params.projectId}
        initialItems={items}
        canUpdateStatus={canUpdateStatus}
      />
    </div>
  );
}
