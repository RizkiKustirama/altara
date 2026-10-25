import React from "react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { assertProjectAccess } from "@/lib/auth-guard";
import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { projectCrews } from "@/db/schema/project-crews";
import { users } from "@/db/schema/users";
import { projectVendors } from "@/db/schema/vendors";
import { vendors } from "@/db/schema/vendors";
import { weddingParties } from "@/db/schema/wedding-parties";
import { eq } from "drizzle-orm";
import {
  EmergencyDialSheet,
  type ContactEntry,
} from "@/components/mobile/emergency-dial-sheet";

export const dynamic = "force-dynamic";

interface FieldContactsPageProps {
  params: {
    projectId: string;
  };
}

export default async function FieldContactsPage({
  params,
}: FieldContactsPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const access = await assertProjectAccess(session, params.projectId);
  if (!access.success) {
    notFound();
  }

  const [project] = await db
    .select({
      id: projects.id,
      projectName: projects.projectName,
    })
    .from(projects)
    .where(eq(projects.id, params.projectId));

  if (!project) notFound();

  // 1. Crew Contacts
  const crewRows = await db
    .select({
      id: projectCrews.id,
      role: projectCrews.roleInProject,
      fullName: users.fullName,
      phone: users.phone,
    })
    .from(projectCrews)
    .innerJoin(users, eq(projectCrews.userId, users.id))
    .where(eq(projectCrews.projectId, params.projectId));

  // 2. Vendor Contacts
  const vendorRows = await db
    .select({
      id: projectVendors.id,
      category: projectVendors.category,
      vendorName: vendors.vendorName,
      picName: vendors.picName,
      phone: vendors.phone,
    })
    .from(projectVendors)
    .innerJoin(vendors, eq(projectVendors.vendorId, vendors.id))
    .where(eq(projectVendors.projectId, params.projectId));

  // 3. Family Contacts
  const familyRows = await db
    .select({
      id: weddingParties.id,
      name: weddingParties.name,
      relationship: weddingParties.relationship,
      ceremonialRole: weddingParties.ceremonialRole,
      phone: weddingParties.phone,
      notes: weddingParties.notes,
    })
    .from(weddingParties)
    .where(eq(weddingParties.projectId, params.projectId));

  const allContacts: ContactEntry[] = [
    // Crews
    ...crewRows.map((c) => ({
      id: `crew-${c.id}`,
      category: "CREW" as const,
      name: c.fullName,
      roleOrCategory: c.role.replace(/_/g, " "),
      phone: c.phone || "-",
    })),
    // Vendors
    ...vendorRows.map((v) => ({
      id: `vendor-${v.id}`,
      category: "VENDOR" as const,
      name: `${v.vendorName} (${v.picName})`,
      roleOrCategory: v.category.replace(/_/g, " "),
      phone: v.phone || "-",
    })),
    // Family VIPs
    ...familyRows.map((f) => ({
      id: `family-${f.id}`,
      category: "FAMILY" as const,
      name: f.name,
      roleOrCategory: f.ceremonialRole
        ? `${f.relationship.replace(/_/g, " ")} (${f.ceremonialRole})`
        : f.relationship.replace(/_/g, " "),
      phone: f.phone || "-",
      notes: f.notes,
    })),
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-base font-bold text-stone-100 tracking-tight">
            Speed-Dial Kontak Darurat
          </h2>
          <p className="text-xs text-stone-400">
            Panggilan 1-ketuk langsung ke vendor, kru lapangan, dan keluarga pengantin.
          </p>
        </div>
      </div>

      <EmergencyDialSheet
        projectName={project.projectName}
        contacts={allContacts}
      />
    </div>
  );
}
