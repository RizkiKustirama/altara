import { db } from "../db";
import { projectRundowns, ProjectRundown } from "../db/schema/rundowns";
import { eq, asc, and } from "drizzle-orm";
import {
  parseTimeToMinutes,
  formatMinutesToTime,
  calculateDurationMinutes,
  addMinutesToTime,
  propagateRundownTimes,
  type RundownTimeItem,
} from "../lib/rundown-time";

export {
  parseTimeToMinutes,
  formatMinutesToTime,
  calculateDurationMinutes,
  addMinutesToTime,
  propagateRundownTimes,
  type RundownTimeItem,
};

// -------------------------------------------------------------
// Database Operations for Project Rundowns
// -------------------------------------------------------------

export async function getProjectRundowns(projectId: string): Promise<ProjectRundown[]> {
  return await db
    .select()
    .from(projectRundowns)
    .where(eq(projectRundowns.projectId, projectId))
    .orderBy(asc(projectRundowns.orderIndex));
}

export async function createProjectRundownItem(
  projectId: string,
  input: {
    title: string;
    description?: string | null;
    startTime: string;
    endTime: string;
    picRole?: string | null;
    musicCue?: string | null;
    lightingCue?: string | null;
    status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
  }
): Promise<ProjectRundown> {
  const existing = await getProjectRundowns(projectId);
  const lastItem = existing[existing.length - 1];
  const nextOrderIndex = lastItem ? lastItem.orderIndex + 1 : 0;

  const [created] = await db
    .insert(projectRundowns)
    .values({
      projectId,
      orderIndex: nextOrderIndex,
      title: input.title,
      description: input.description ?? null,
      startTime: input.startTime,
      endTime: input.endTime,
      picRole: input.picRole ?? null,
      musicCue: input.musicCue ?? null,
      lightingCue: input.lightingCue ?? null,
      status: input.status ?? "PENDING",
    })
    .returning();

  if (!created) {
    throw new Error("Gagal membuat item rundown proyek");
  }

  return created;
}

export async function updateProjectRundownItem(
  itemId: string,
  projectId: string,
  input: Partial<{
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    picRole: string | null;
    musicCue: string | null;
    lightingCue: string | null;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
  }>
): Promise<ProjectRundown | null> {
  const [updated] = await db
    .update(projectRundowns)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(projectRundowns.id, itemId), eq(projectRundowns.projectId, projectId)))
    .returning();

  return updated ?? null;
}

export async function deleteProjectRundownItem(itemId: string, projectId: string): Promise<boolean> {
  await db
    .delete(projectRundowns)
    .where(and(eq(projectRundowns.id, itemId), eq(projectRundowns.projectId, projectId)));

  // Re-index remaining items
  const remaining = await getProjectRundowns(projectId);
  for (let i = 0; i < remaining.length; i++) {
    const item = remaining[i];
    if (item && item.orderIndex !== i) {
      await db
        .update(projectRundowns)
        .set({ orderIndex: i, updatedAt: new Date() })
        .where(eq(projectRundowns.id, item.id));
    }
  }

  return true;
}

export async function reorderAndPropagateProjectRundown(
  projectId: string,
  orderedIds: string[]
): Promise<ProjectRundown[]> {
  const existing = await getProjectRundowns(projectId);
  const itemMap = new Map(existing.map((item) => [item.id, item]));

  const reordered = orderedIds
    .map((id, index) => {
      const item = itemMap.get(id);
      return item ? { ...item, orderIndex: index } : null;
    })
    .filter((item): item is ProjectRundown => item !== null);

  const propagated = propagateRundownTimes(reordered);

  // Batch update in transaction
  await db.transaction(async (tx) => {
    for (const item of propagated) {
      await tx
        .update(projectRundowns)
        .set({
          orderIndex: item.orderIndex ?? 0,
          startTime: item.startTime,
          endTime: item.endTime,
          updatedAt: new Date(),
        })
        .where(eq(projectRundowns.id, item.id));
    }
  });

  return await getProjectRundowns(projectId);
}

export async function shiftProjectRundownTimes(
  projectId: string,
  startFromIndex: number,
  deltaMinutes: number
): Promise<ProjectRundown[]> {
  const existing = await getProjectRundowns(projectId);
  if (existing.length === 0 || deltaMinutes === 0) return existing;

  await db.transaction(async (tx) => {
    for (const item of existing) {
      if (item.orderIndex >= startFromIndex) {
        const newStart = addMinutesToTime(item.startTime, deltaMinutes);
        const newEnd = addMinutesToTime(item.endTime, deltaMinutes);
        await tx
          .update(projectRundowns)
          .set({
            startTime: newStart,
            endTime: newEnd,
            updatedAt: new Date(),
          })
          .where(eq(projectRundowns.id, item.id));
      }
    }
  });

  return await getProjectRundowns(projectId);
}
