import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { projectVendors } from "@/db/schema/vendors";
import { vendors } from "@/db/schema/vendors";
import { projectRundowns } from "@/db/schema/rundowns";
import { users } from "@/db/schema/users";
import { eq, asc } from "drizzle-orm";
import type { PublicPortalDTO } from "@/types/public-portal-dto";

/**
 * Mengambil data portal publik pengantin berdasarkan token rahasia URL (Bella & Kevin).
 * Dilindungi oleh arsitektur sanitasi data ketat: zero financial leak & zero personal privacy leak.
 */
export async function getPublicPortalDataByToken(
  token: string
): Promise<PublicPortalDTO | null> {
  if (!token || typeof token !== "string" || token.length < 5) {
    return null;
  }

  // 1. Fetch Project Public Data
  const [project] = await db
    .select({
      id: projects.id,
      projectName: projects.projectName,
      clientGroomName: projects.clientGroomName,
      clientBrideName: projects.clientBrideName,
      weddingDate: projects.weddingDate,
      venueName: projects.venueName,
      venueAddress: projects.venueAddress,
      status: projects.status,
      leadPlannerName: users.fullName,
    })
    .from(projects)
    .leftJoin(users, eq(projects.leadPlannerId, users.id))
    .where(eq(projects.publicToken, token));

  if (!project) {
    return null;
  }

  // 2. Fetch Confirmed Vendors (Only Category & Vendor Name, NEVER price or personal phone)
  const vendorSlots = await db
    .select({
      category: projectVendors.category,
      vendorName: vendors.vendorName,
      status: projectVendors.contractStatus,
    })
    .from(projectVendors)
    .innerJoin(vendors, eq(projectVendors.vendorId, vendors.id))
    .where(eq(projectVendors.projectId, project.id))
    .orderBy(asc(projectVendors.category));

  // 3. Fetch Rundown Highlights (Only Times & Titles, NEVER AV cues or internal notes)
  const rundowns = await db
    .select({
      orderIndex: projectRundowns.orderIndex,
      startTime: projectRundowns.startTime,
      endTime: projectRundowns.endTime,
      title: projectRundowns.title,
    })
    .from(projectRundowns)
    .where(eq(projectRundowns.projectId, project.id))
    .orderBy(asc(projectRundowns.orderIndex));

  // 4. Calculate Preparation Progress
  // Based on confirmed vendor partners + rundown sessions ready
  const confirmedVendorsCount = vendorSlots.filter(
    (v) =>
      v.status === "BOOKED" ||
      v.status === "DP_PAID" ||
      v.status === "SETTLED"
  ).length;

  const totalMilestones = Math.max(1, vendorSlots.length + (rundowns.length > 0 ? 1 : 0));
  const completedMilestones =
    confirmedVendorsCount + (rundowns.length > 0 ? 1 : 0);
  const percentage = Math.min(
    100,
    Math.round((completedMilestones / totalMilestones) * 100)
  );

  const weddingDateTimestamp = new Date(project.weddingDate + "T08:00:00+07:00").getTime();

  return {
    projectName: project.projectName,
    clientGroomName: project.clientGroomName,
    clientBrideName: project.clientBrideName,
    weddingDate: project.weddingDate,
    venueName: project.venueName,
    venueAddress: project.venueAddress,
    leadPlannerName: project.leadPlannerName || "Tim Altara Wedding Planner",
    status: project.status,
    weddingDateTimestamp,
    preparationProgress: {
      totalMilestones,
      completedMilestones,
      percentage,
    },
    confirmedVendors: vendorSlots.map((v) => ({
      category: v.category,
      vendorName: v.vendorName,
      status: v.status,
    })),
    rundownHighlights: rundowns.map((r) => ({
      orderIndex: r.orderIndex,
      startTime: r.startTime.slice(0, 5),
      endTime: r.endTime.slice(0, 5),
      title: r.title,
    })),
  };
}
