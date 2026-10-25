import { db } from "@/db";
import { vendors, projectVendors, projects } from "@/db/schema";
import { eq, and, desc, asc, ilike } from "drizzle-orm";
import type { ActionResponse } from "@/types/action-response";
import type {
  CreateVendorInput,
  UpdateVendorInput,
  SlotVendorInput,
  UpdateVendorSlotInput,
  VendorCategory,
} from "@/schemas/vendor-schema";

export interface VendorDTO {
  id: string;
  vendorName: string;
  category: string;
  picName: string;
  phone: string;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ProjectVendorSlotDTO {
  slotId: string;
  projectId: string;
  vendorId: string;
  vendorName: string;
  category: string;
  picName: string;
  phone: string;
  contractStatus: string;
  notes: string | null;
  createdAt: string;
}

export interface MasterVendorFilter {
  category?: VendorCategory;
  search?: string;
  isActive?: boolean;
}

/**
 * Mengambil daftar master vendor rekanan dengan filter kategori dan pencarian.
 */
export async function getMasterVendors(
  filters?: MasterVendorFilter
): Promise<ActionResponse<VendorDTO[]>> {
  try {
    const conditions = [];

    if (filters?.category) {
      conditions.push(eq(vendors.category, filters.category));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(vendors.isActive, filters.isActive));
    }
    if (filters?.search) {
      conditions.push(ilike(vendors.vendorName, `%${filters.search}%`));
    }

    const rows = await db.query.vendors.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [asc(vendors.category), asc(vendors.vendorName)],
    });

    const data: VendorDTO[] = rows.map((v) => ({
      id: v.id,
      vendorName: v.vendorName,
      category: v.category,
      picName: v.picName,
      phone: v.phone,
      email: v.email,
      address: v.address,
      isActive: v.isActive,
      createdAt: v.createdAt.toISOString(),
    }));

    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal mengambil daftar master vendor.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

/**
 * Mengambil detail data master vendor berdasarkan ID.
 */
export async function getVendorById(id: string): Promise<ActionResponse<VendorDTO>> {
  try {
    const row = await db.query.vendors.findFirst({
      where: eq(vendors.id, id),
    });

    if (!row) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Data vendor tidak ditemukan." },
      };
    }

    return {
      success: true,
      data: {
        id: row.id,
        vendorName: row.vendorName,
        category: row.category,
        picName: row.picName,
        phone: row.phone,
        email: row.email,
        address: row.address,
        isActive: row.isActive,
        createdAt: row.createdAt.toISOString(),
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal mengambil data vendor.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

/**
 * Mendaftarkan master vendor rekanan baru ke dalam sistem.
 */
export async function createMasterVendor(
  input: CreateVendorInput
): Promise<ActionResponse<VendorDTO>> {
  try {
    const [inserted] = await db
      .insert(vendors)
      .values({
        vendorName: input.vendorName,
        category: input.category,
        picName: input.picName,
        phone: input.phone,
        email: input.email || null,
        address: input.address || null,
        isActive: input.isActive ?? true,
      })
      .returning();

    if (!inserted) {
      return {
        success: false,
        error: { code: "BAD_REQUEST", message: "Gagal menyimpan vendor baru." },
      };
    }

    return {
      success: true,
      data: {
        id: inserted.id,
        vendorName: inserted.vendorName,
        category: inserted.category,
        picName: inserted.picName,
        phone: inserted.phone,
        email: inserted.email,
        address: inserted.address,
        isActive: inserted.isActive,
        createdAt: inserted.createdAt.toISOString(),
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal mendaftarkan vendor baru.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

/**
 * Memperbarui data master vendor rekanan.
 */
export async function updateMasterVendor(
  input: UpdateVendorInput
): Promise<ActionResponse<VendorDTO>> {
  try {
    const [updated] = await db
      .update(vendors)
      .set({
        vendorName: input.vendorName,
        category: input.category,
        picName: input.picName,
        phone: input.phone,
        email: input.email !== undefined ? (input.email || null) : undefined,
        address: input.address !== undefined ? (input.address || null) : undefined,
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, input.id))
      .returning();

    if (!updated) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Vendor target tidak ditemukan." },
      };
    }

    return {
      success: true,
      data: {
        id: updated.id,
        vendorName: updated.vendorName,
        category: updated.category,
        picName: updated.picName,
        phone: updated.phone,
        email: updated.email,
        address: updated.address,
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal memperbarui data vendor.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

/**
 * Mengambil seluruh vendor yang telah dislotting ke proyek pernikahan tertentu.
 */
export async function getProjectVendors(
  projectId: string
): Promise<ActionResponse<ProjectVendorSlotDTO[]>> {
  try {
    const slots = await db.query.projectVendors.findMany({
      where: eq(projectVendors.projectId, projectId),
      with: {
        vendor: true,
      },
      orderBy: [asc(projectVendors.category), desc(projectVendors.createdAt)],
    });

    const data: ProjectVendorSlotDTO[] = slots.map((s) => ({
      slotId: s.id,
      projectId: s.projectId,
      vendorId: s.vendorId,
      vendorName: s.vendor?.vendorName ?? "Vendor",
      category: s.category,
      picName: s.vendor?.picName ?? "-",
      phone: s.vendor?.phone ?? "-",
      contractStatus: s.contractStatus,
      notes: s.notes,
      createdAt: s.createdAt.toISOString(),
    }));

    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal mengambil daftar vendor proyek.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

/**
 * Memasangkan master vendor ke dalam slot proyek pernikahan.
 */
export async function slotVendorToProject(
  input: SlotVendorInput
): Promise<ActionResponse<ProjectVendorSlotDTO>> {
  try {
    // 1. Verifikasi proyek ada
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, input.projectId),
      columns: { id: true, projectName: true },
    });

    if (!project) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Data proyek tidak ditemukan." },
      };
    }

    // 2. Verifikasi vendor ada
    const vendor = await db.query.vendors.findFirst({
      where: eq(vendors.id, input.vendorId),
    });

    if (!vendor) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Data vendor tidak ditemukan." },
      };
    }

    // 3. Simpan relasi ke project_vendors
    const [inserted] = await db
      .insert(projectVendors)
      .values({
        projectId: input.projectId,
        vendorId: input.vendorId,
        category: input.category,
        contractStatus: input.contractStatus ?? "INQUIRY",
        notes: input.notes ?? null,
      })
      .returning();

    if (!inserted) {
      return {
        success: false,
        error: { code: "BAD_REQUEST", message: "Gagal memasangkan vendor ke proyek." },
      };
    }

    return {
      success: true,
      data: {
        slotId: inserted.id,
        projectId: inserted.projectId,
        vendorId: inserted.vendorId,
        vendorName: vendor.vendorName,
        category: inserted.category,
        picName: vendor.picName,
        phone: vendor.phone,
        contractStatus: inserted.contractStatus,
        notes: inserted.notes,
        createdAt: inserted.createdAt.toISOString(),
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal memasangkan vendor ke proyek.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

/**
 * Memperbarui status transaksi/kontrak vendor pada proyek.
 */
export async function updateVendorSlot(
  input: UpdateVendorSlotInput
): Promise<ActionResponse<{ slotId: string; contractStatus?: string; notes?: string | null }>> {
  try {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (input.contractStatus) updateData.contractStatus = input.contractStatus;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const [updated] = await db
      .update(projectVendors)
      .set(updateData)
      .where(
        and(
          eq(projectVendors.id, input.slotId),
          eq(projectVendors.projectId, input.projectId)
        )
      )
      .returning();

    if (!updated) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Slot vendor proyek tidak ditemukan." },
      };
    }

    return {
      success: true,
      data: {
        slotId: updated.id,
        contractStatus: updated.contractStatus,
        notes: updated.notes,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal memperbarui status slot vendor.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

/**
 * Menghapus penugasan vendor dari proyek acara.
 */
export async function removeVendorFromProject(
  slotId: string,
  projectId: string
): Promise<ActionResponse<{ deletedId: string }>> {
  try {
    const deleted = await db
      .delete(projectVendors)
      .where(
        and(
          eq(projectVendors.id, slotId),
          eq(projectVendors.projectId, projectId)
        )
      )
      .returning({ id: projectVendors.id });

    if (!deleted.length || !deleted[0]) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Slot vendor proyek tidak ditemukan." },
      };
    }

    return {
      success: true,
      data: { deletedId: deleted[0].id },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal menghapus vendor dari proyek.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}
