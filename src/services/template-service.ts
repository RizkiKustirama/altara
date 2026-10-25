import { db } from "../db";
import {
  eventTemplates,
  templateRundownItems,
  projectRundowns,
  EventTemplate,
  TemplateRundownItem,
  ProjectRundown,
} from "../db/schema/rundowns";
import { eq, asc } from "drizzle-orm";
import {
  parseTimeToMinutes,
  addMinutesToTime,
} from "./rundown-service";

export interface TemplateItemClonerInput {
  orderIndex: number;
  startTime: string;
  endTime: string;
  title: string;
  description?: string | null;
  picRole?: string | null;
  musicCue?: string | null;
  lightingCue?: string | null;
}

/**
 * Calculates time offset between the template's first item and customStartTime,
 * and returns shifted copies of the template items.
 */
export function calculateTemplateItemOffsets(
  items: TemplateItemClonerInput[],
  customStartTime?: string
): TemplateItemClonerInput[] {
  if (!items || items.length === 0) return [];

  // Sort items by orderIndex
  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  const firstItem = sorted[0];
  if (!firstItem) return [];

  if (!customStartTime) {
    return sorted.map((item, index) => ({
      ...item,
      orderIndex: index,
    }));
  }

  const templateFirstStartMinutes = parseTimeToMinutes(firstItem.startTime);
  const customStartMinutes = parseTimeToMinutes(customStartTime);
  const deltaMinutes = customStartMinutes - templateFirstStartMinutes;

  return sorted.map((item, index) => ({
    ...item,
    orderIndex: index,
    startTime: addMinutesToTime(item.startTime, deltaMinutes),
    endTime: addMinutesToTime(item.endTime, deltaMinutes),
  }));
}

/**
 * Returns all active event templates.
 */
export async function getEventTemplates(): Promise<
  (EventTemplate & { itemCount: number })[]
> {
  const templates = await db
    .select()
    .from(eventTemplates)
    .orderBy(asc(eventTemplates.templateName));

  const items = await db.select().from(templateRundownItems);
  const countMap = new Map<string, number>();

  for (const item of items) {
    countMap.set(item.templateId, (countMap.get(item.templateId) ?? 0) + 1);
  }

  return templates.map((tmpl) => ({
    ...tmpl,
    itemCount: countMap.get(tmpl.id) ?? 0,
  }));
}

/**
 * Returns template with its rundown items sorted by orderIndex.
 */
export async function getTemplateByIdWithItems(
  templateId: string
): Promise<{ template: EventTemplate; items: TemplateRundownItem[] } | null> {
  const [template] = await db
    .select()
    .from(eventTemplates)
    .where(eq(eventTemplates.id, templateId));

  if (!template) return null;

  const items = await db
    .select()
    .from(templateRundownItems)
    .where(eq(templateRundownItems.templateId, templateId))
    .orderBy(asc(templateRundownItems.orderIndex));

  return { template, items };
}

/**
 * Duplicates template procession items into project_rundowns.
 * If replaceExisting is true, deletes all current project_rundowns for the project first.
 */
export async function applyTemplateToProject(
  projectId: string,
  templateId: string,
  customStartTime?: string,
  replaceExisting = true
): Promise<ProjectRundown[]> {
  const templateData = await getTemplateByIdWithItems(templateId);
  if (!templateData || templateData.items.length === 0) {
    throw new Error("Template prosesi tidak ditemukan atau belum memiliki susunan acara.");
  }

  const transformedItems = calculateTemplateItemOffsets(
    templateData.items,
    customStartTime
  );

  return await db.transaction(async (tx) => {
    if (replaceExisting) {
      await tx
        .delete(projectRundowns)
        .where(eq(projectRundowns.projectId, projectId));
    }

    const nextOrderOffset = replaceExisting
      ? 0
      : (
          await tx
            .select()
            .from(projectRundowns)
            .where(eq(projectRundowns.projectId, projectId))
        ).length;

    const valuesToInsert = transformedItems.map((item, index) => ({
      projectId,
      orderIndex: nextOrderOffset + index,
      startTime: item.startTime,
      endTime: item.endTime,
      title: item.title,
      description: item.description ?? null,
      picRole: item.picRole ?? null,
      musicCue: item.musicCue ?? null,
      lightingCue: item.lightingCue ?? null,
      status: "PENDING" as const,
    }));

    await tx.insert(projectRundowns).values(valuesToInsert);

    return await tx
      .select()
      .from(projectRundowns)
      .where(eq(projectRundowns.projectId, projectId))
      .orderBy(asc(projectRundowns.orderIndex));
  });
}
