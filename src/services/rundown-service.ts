import { db } from "../db";
import { projectRundowns, ProjectRundown } from "../db/schema/rundowns";
import { eq, asc, and } from "drizzle-orm";

export interface RundownTimeItem {
  id: string;
  orderIndex?: number;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  [key: string]: any;
}

/**
 * Parses time string ("08:30" or "08:30:00") into minutes from midnight (0 - 1439).
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(":");
  const hours = parseInt(parts[0] ?? "0", 10) || 0;
  const minutes = parseInt(parts[1] ?? "0", 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Formats total minutes from midnight into "HH:mm:ss" or "HH:mm".
 */
export function formatMinutesToTime(totalMinutes: number, includeSeconds = true): string {
  // Normalize within 24h day (handle overflow/wrap-around gracefully)
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return includeSeconds ? `${hh}:${mm}:00` : `${hh}:${mm}`;
}

/**
 * Calculates duration in minutes between start time and end time.
 * If end time is earlier than start time (cross midnight), wraps around 24 hours.
 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  if (endMin >= startMin) {
    return endMin - startMin;
  }
  return 1440 - startMin + endMin;
}

/**
 * Adds an offset in minutes (can be negative) to a given time string.
 */
export function addMinutesToTime(timeStr: string, minutesToAdd: number, includeSeconds = true): string {
  const currentMinutes = parseTimeToMinutes(timeStr);
  return formatMinutesToTime(currentMinutes + minutesToAdd, includeSeconds);
}

/**
 * Propagates times through a sequential list of rundown items.
 * Each item starts at the previous item's end time.
 * If `initialStartTime` is provided, the first item starts at that time.
 */
export function propagateRundownTimes<T extends RundownTimeItem>(
  items: T[],
  initialStartTime?: string
): (T & { durationMinutes: number })[] {
  if (!items || items.length === 0) return [];

  // Sort by orderIndex if present, otherwise maintain input order
  const sorted = [...items].sort((a, b) => {
    if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
      return a.orderIndex - b.orderIndex;
    }
    return 0;
  });

  const firstItem = sorted[0];
  if (!firstItem) return [];

  const result: (T & { durationMinutes: number })[] = [];
  let currentStartTime = initialStartTime ? initialStartTime : firstItem.startTime;

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    if (!item) continue;

    const duration =
      item.durationMinutes !== undefined && item.durationMinutes > 0
        ? item.durationMinutes
        : calculateDurationMinutes(item.startTime, item.endTime);

    const startMinutes = parseTimeToMinutes(currentStartTime);
    const endMinutes = startMinutes + duration;
    const endTime = formatMinutesToTime(endMinutes);

    result.push({
      ...item,
      startTime: formatMinutesToTime(startMinutes),
      endTime,
      durationMinutes: duration,
    });

    currentStartTime = endTime;
  }

  return result;
}

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
