import { db } from "../db";
import { projects } from "../db/schema/projects";
import { users } from "../db/schema/users";
import { weddingParties } from "../db/schema/wedding-parties";
import { projectVendors, vendors } from "../db/schema/vendors";
import { projectRundowns } from "../db/schema/rundowns";
import { eq, asc } from "drizzle-orm";
import { calculateDurationMinutes } from "../lib/rundown-time";
import type {
  GuidebookTMDTO,
  GuidebookProjectInfo,
  GuidebookVendorItem,
  GuidebookFamilyMember,
  GuidebookRundownItem,
} from "../types/guidebook-dto";

/**
 * Aggregates all project details, confirmed vendors, family directory,
 * and rundown cue-sheet into a clean DTO for Technical Meeting Guidebook PDF.
 * Explicitly excludes all internal financial costs, margins, and budget numbers.
 */
export async function aggregateGuidebookData(projectId: string): Promise<GuidebookTMDTO | null> {
  // 1. Fetch Project & Lead Planner
  const [projectData] = await db
    .select({
      id: projects.id,
      projectName: projects.projectName,
      weddingDate: projects.weddingDate,
      venueName: projects.venueName,
      leadPlannerId: projects.leadPlannerId,
      leadPlannerName: users.fullName,
      leadPlannerPhone: users.phone,
    })
    .from(projects)
    .leftJoin(users, eq(projects.leadPlannerId, users.id))
    .where(eq(projects.id, projectId));

  if (!projectData) return null;

  const project: GuidebookProjectInfo = {
    id: projectData.id,
    projectName: projectData.projectName,
    weddingDate: projectData.weddingDate,
    venueName: projectData.venueName,
    leadPlannerName: projectData.leadPlannerName ?? null,
    leadPlannerPhone: projectData.leadPlannerPhone ?? null,
  };

  // 2. Fetch Family Members / VIP
  const rawFamily = await db
    .select()
    .from(weddingParties)
    .where(eq(weddingParties.projectId, projectId))
    .orderBy(asc(weddingParties.createdAt));

  const familyMembers: GuidebookFamilyMember[] = rawFamily.map((f) => ({
    name: f.name,
    relationship: f.relationship,
    phone: f.phone ?? null,
    ceremonialRole: f.ceremonialRole ?? null,
    notes: f.notes ?? null,
  }));

  // 3. Fetch Confirmed Vendors (Exclude CANCELLED)
  const rawVendors = await db
    .select({
      category: projectVendors.category,
      contractStatus: projectVendors.contractStatus,
      notes: projectVendors.notes,
      vendorName: vendors.vendorName,
      picName: vendors.picName,
      phone: vendors.phone,
    })
    .from(projectVendors)
    .innerJoin(vendors, eq(projectVendors.vendorId, vendors.id))
    .where(eq(projectVendors.projectId, projectId));

  const confirmedVendors: GuidebookVendorItem[] = rawVendors
    .filter((v) => v.contractStatus !== "CANCELLED")
    .map((v) => ({
      category: v.category,
      vendorName: v.vendorName,
      picName: v.picName,
      phone: v.phone,
      contractStatus: v.contractStatus,
      notes: v.notes ?? null,
    }));

  // 4. Fetch Rundown Items
  const rawRundowns = await db
    .select()
    .from(projectRundowns)
    .where(eq(projectRundowns.projectId, projectId))
    .orderBy(asc(projectRundowns.orderIndex));

  const rundownItems: GuidebookRundownItem[] = rawRundowns.map((r, index) => {
    const start = r.startTime.slice(0, 5);
    const end = r.endTime.slice(0, 5);
    const duration = calculateDurationMinutes(r.startTime, r.endTime);

    return {
      orderIndex: index + 1,
      timeRange: `${start} - ${end}`,
      durationMinutes: duration,
      title: r.title,
      description: r.description ?? null,
      picRole: r.picRole ?? null,
      musicCue: r.musicCue ?? null,
      lightingCue: r.lightingCue ?? null,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    project,
    familyMembers,
    vendors: confirmedVendors,
    rundownItems,
  };
}
