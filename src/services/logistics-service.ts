import { db } from "@/db";
import { sacredBelongings, type SacredBelonging } from "@/db/schema/supporting-phase2";
import { users } from "@/db/schema/users";
import { eq, and, asc } from "drizzle-orm";

export interface SacredBelongingDTO extends SacredBelonging {
  holderName?: string | null;
  holderPhone?: string | null;
}

const DEFAULT_SACRED_ITEMS = [
  {
    itemName: "Kotak Cincin Pernikahan",
    currentLocation: "Kamar Pengantin",
    notes: "Wajib diserahkan ke LO Pengantin saat prosesi tukar cincin",
  },
  {
    itemName: "Buku Nikah & Dokumen KUA",
    currentLocation: "Meja Registrasi Akad",
    notes: "Diserahkan langsung ke Penghulu / Petugas KUA",
  },
  {
    itemName: "Mahar & Mas Kawin",
    currentLocation: "Meja Akad",
    notes: "Dicek kelengkapan sebelum ijab kabul dimulai",
  },
  {
    itemName: "Gaun & Jas Ganti Resepsi",
    currentLocation: "Ruang Rias / Wardrobe",
    notes: "Disiapkan tim wardrobe 30 menit sebelum sesi kirab",
  },
];

/**
 * Mengambil daftar barang sakral proyek. Jika belum ada, otomatis inisialisasi barang sakral standar.
 */
export async function getSacredBelongings(
  projectId: string
): Promise<SacredBelongingDTO[]> {
  const items = await db
    .select({
      id: sacredBelongings.id,
      projectId: sacredBelongings.projectId,
      itemName: sacredBelongings.itemName,
      currentLocation: sacredBelongings.currentLocation,
      currentHolderId: sacredBelongings.currentHolderId,
      status: sacredBelongings.status,
      notes: sacredBelongings.notes,
      updatedAt: sacredBelongings.updatedAt,
      holderName: users.fullName,
      holderPhone: users.phone,
    })
    .from(sacredBelongings)
    .leftJoin(users, eq(sacredBelongings.currentHolderId, users.id))
    .where(eq(sacredBelongings.projectId, projectId))
    .orderBy(asc(sacredBelongings.itemName));

  // If items empty, auto-seed default items
  if (items.length === 0) {
    for (const def of DEFAULT_SACRED_ITEMS) {
      await db.insert(sacredBelongings).values({
        projectId,
        itemName: def.itemName,
        currentLocation: def.currentLocation,
        notes: def.notes,
        status: "NOT_RECEIVED",
      });
    }

    // Re-fetch after seeding
    return getSacredBelongings(projectId);
  }

  return items;
}

/**
 * Membuat pencatatan barang sakral baru.
 */
export async function createSacredItem(
  projectId: string,
  data: {
    itemName: string;
    currentLocation: string;
    currentHolderId?: string | null;
    status?: "NOT_RECEIVED" | "WITH_CREW" | "AT_STAGE" | "RETURNED_TO_FAMILY";
    notes?: string | null;
  }
): Promise<SacredBelonging> {
  const [created] = await db
    .insert(sacredBelongings)
    .values({
      projectId,
      itemName: data.itemName,
      currentLocation: data.currentLocation,
      currentHolderId: data.currentHolderId || null,
      status: data.status ?? "NOT_RECEIVED",
      notes: data.notes || null,
    })
    .returning();

  if (!created) {
    throw new Error("Gagal menyimpan barang sakral");
  }

  return created;
}

/**
 * Memperbarui status, posisi fisik, atau pemegang barang sakral.
 */
export async function updateSacredItemStatus(
  itemId: string,
  projectId: string,
  updates: {
    status?: "NOT_RECEIVED" | "WITH_CREW" | "AT_STAGE" | "RETURNED_TO_FAMILY";
    currentLocation?: string;
    currentHolderId?: string | null;
    notes?: string | null;
  }
): Promise<SacredBelonging | null> {
  const [updated] = await db
    .update(sacredBelongings)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(sacredBelongings.id, itemId),
        eq(sacredBelongings.projectId, projectId)
      )
    )
    .returning();

  return updated ?? null;
}

/**
 * Menghapus pencatatan barang sakral.
 */
export async function deleteSacredItem(
  itemId: string,
  projectId: string
): Promise<boolean> {
  const res = await db
    .delete(sacredBelongings)
    .where(
      and(
        eq(sacredBelongings.id, itemId),
        eq(sacredBelongings.projectId, projectId)
      )
    );

  return Boolean(res);
}
