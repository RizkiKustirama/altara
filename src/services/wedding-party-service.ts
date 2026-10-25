import { db } from "../db";
import { weddingParties, WeddingParty } from "../db/schema/wedding-parties";
import { eq, and, desc } from "drizzle-orm";
import { sanitizeIndonesianPhone } from "../lib/whatsapp";

export async function getWeddingPartyMembers(projectId: string): Promise<WeddingParty[]> {
  return await db
    .select()
    .from(weddingParties)
    .where(eq(weddingParties.projectId, projectId))
    .orderBy(desc(weddingParties.createdAt));
}

export async function createWeddingPartyMember(
  projectId: string,
  input: {
    name: string;
    relationship: string;
    phone?: string | null;
    ceremonialRole?: string | null;
    notes?: string | null;
  }
): Promise<WeddingParty> {
  const sanitizedPhone = input.phone && input.phone.trim() !== ""
    ? sanitizeIndonesianPhone(input.phone)
    : null;

  const [created] = await db
    .insert(weddingParties)
    .values({
      projectId,
      name: input.name,
      relationship: input.relationship,
      phone: sanitizedPhone,
      ceremonialRole: input.ceremonialRole ?? null,
      notes: input.notes ?? null,
    })
    .returning();

  if (!created) {
    throw new Error("Gagal menambahkan anggota keluarga/VIP");
  }

  return created;
}

export async function updateWeddingPartyMember(
  id: string,
  projectId: string,
  input: Partial<{
    name: string;
    relationship: string;
    phone: string | null;
    ceremonialRole: string | null;
    notes: string | null;
  }>
): Promise<WeddingParty | null> {
  const sanitizedPhone =
    input.phone !== undefined
      ? input.phone && input.phone.trim() !== ""
        ? sanitizeIndonesianPhone(input.phone)
        : null
      : undefined;

  const [updated] = await db
    .update(weddingParties)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.relationship !== undefined ? { relationship: input.relationship } : {}),
      ...(sanitizedPhone !== undefined ? { phone: sanitizedPhone } : {}),
      ...(input.ceremonialRole !== undefined ? { ceremonialRole: input.ceremonialRole } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    })
    .where(and(eq(weddingParties.id, id), eq(weddingParties.projectId, projectId)))
    .returning();

  return updated ?? null;
}

export async function deleteWeddingPartyMember(
  id: string,
  projectId: string
): Promise<boolean> {
  await db
    .delete(weddingParties)
    .where(and(eq(weddingParties.id, id), eq(weddingParties.projectId, projectId)));

  return true;
}
