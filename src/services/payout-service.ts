import { db } from "@/db";
import { crewPayouts, type CrewPayout } from "@/db/schema/company-finances";
import { projects } from "@/db/schema/projects";
import { users } from "@/db/schema/users";
import { calculateCrewPayout } from "@/lib/finance-math";
import { eq, desc, inArray } from "drizzle-orm";

export interface CrewPayoutDTO {
  id: string;
  projectId: string;
  projectName: string;
  weddingDate: string;
  userId: string;
  crewName: string;
  crewPhone: string;
  dailyRate: string;
  sessionCount: string;
  totalPayout: string;
  payoutStatus: "PENDING" | "PAID";
  paidAt: Date | null;
  notes: string | null;
  createdAt: Date;
}

/**
 * Mengambil daftar seluruh honor kru yang tercatat (Tier 2A: Maya & Dimas).
 */
export async function getAllCrewPayouts(
  filterStatus?: "PENDING" | "PAID"
): Promise<CrewPayoutDTO[]> {
  const query = db
    .select({
      id: crewPayouts.id,
      projectId: crewPayouts.projectId,
      projectName: projects.projectName,
      weddingDate: projects.weddingDate,
      userId: crewPayouts.userId,
      crewName: users.fullName,
      crewPhone: users.phone,
      dailyRate: crewPayouts.dailyRate,
      sessionCount: crewPayouts.sessionCount,
      totalPayout: crewPayouts.totalPayout,
      payoutStatus: crewPayouts.payoutStatus,
      paidAt: crewPayouts.paidAt,
      notes: crewPayouts.notes,
      createdAt: crewPayouts.createdAt,
    })
    .from(crewPayouts)
    .innerJoin(projects, eq(crewPayouts.projectId, projects.id))
    .innerJoin(users, eq(crewPayouts.userId, users.id))
    .orderBy(desc(crewPayouts.createdAt));

  const rows = await query;
  if (!filterStatus) return rows;
  return rows.filter((r) => r.payoutStatus === filterStatus);
}

/**
 * Menambahkan pencatatan honor harian kru pada suatu proyek.
 */
export async function createCrewPayout(data: {
  projectId: string;
  userId: string;
  dailyRate: string;
  sessionCount?: string;
  notes?: string | null;
}): Promise<CrewPayout> {
  const total = calculateCrewPayout(data.dailyRate, data.sessionCount ?? "1.0");

  const [created] = await db
    .insert(crewPayouts)
    .values({
      projectId: data.projectId,
      userId: data.userId,
      dailyRate: data.dailyRate,
      sessionCount: data.sessionCount ?? "1.0",
      totalPayout: String(total),
      payoutStatus: "PENDING",
      notes: data.notes || null,
    })
    .returning();

  if (!created) {
    throw new Error("Gagal membuat pencatatan honor kru");
  }

  return created;
}

/**
 * Mencairkan honor massal (Batch Payout) puluhan kru sekaligus pada hari Senin pagi (Maya & Dimas).
 */
export async function executeBatchPayout(
  payoutIds: string[],
  referenceNotes?: string | null
): Promise<{ updatedCount: number }> {
  if (payoutIds.length === 0) {
    return { updatedCount: 0 };
  }

  const res = await db
    .update(crewPayouts)
    .set({
      payoutStatus: "PAID",
      paidAt: new Date(),
      notes: referenceNotes ? referenceNotes : undefined,
    })
    .where(inArray(crewPayouts.id, payoutIds))
    .returning({ id: crewPayouts.id });

  return { updatedCount: res.length };
}
