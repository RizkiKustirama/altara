import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { projectCrews, projects } from "@/db/schema";
import type { UserSession, GlobalRole } from "@/types/auth";
import type { ActionResponse } from "@/types/action-response";

/**
 * Memvalidasi apakah pengguna memiliki salah satu dari global role yang diizinkan.
 */
export function assertRole(
  session: UserSession | null,
  allowedRoles: readonly GlobalRole[]
): ActionResponse<void> {
  if (!session) {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Sesi kerja telah berakhir. Silakan masuk kembali ke akun Anda.",
      },
    };
  }

  if (!allowedRoles.includes(session.role)) {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Anda tidak memiliki wewenang untuk mengakses atau memodifikasi data ini.",
      },
    };
  }

  return { success: true, data: undefined };
}

/**
 * Memvalidasi apakah pengguna memiliki hak akses ke proyek pernikahan tertentu.
 * - OWNER & MANAGEMENT: Akses penuh ke seluruh proyek (lintas proyek).
 * - CREW: Diizinkan jika menjabat sebagai Lead Planner (PM) proyek ATAU terdaftar pada project_crews.
 */
export async function assertProjectAccess(
  session: UserSession | null,
  projectId: string
): Promise<ActionResponse<void>> {
  if (!session) {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Sesi kerja telah berakhir. Silakan masuk kembali.",
      },
    };
  }

  // OWNER dan MANAGEMENT memiliki hak akses menyeluruh lintas seluruh proyek pernikahan
  if (session.role === "OWNER" || session.role === "MANAGEMENT") {
    return { success: true, data: undefined };
  }

  // Untuk CREW, cek apakah user adalah Lead Planner pada proyek tersebut
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: { leadPlannerId: true },
  });

  if (project?.leadPlannerId === session.userId) {
    return { success: true, data: undefined };
  }

  // Atau cek apakah terdaftar di penugasan skuad proyek
  const assignment = await db.query.projectCrews.findFirst({
    where: and(
      eq(projectCrews.projectId, projectId),
      eq(projectCrews.userId, session.userId)
    ),
    columns: { id: true },
  });

  if (!assignment) {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Anda tidak terdaftar sebagai staf penugasan pada proyek pernikahan ini.",
      },
    };
  }

  return { success: true, data: undefined };
}

/**
 * Memvalidasi apakah pengguna memiliki wewenang manajerial (PM) pada proyek tertentu.
 * - OWNER & MANAGEMENT: Memiliki hak manajerial penuh pada semua proyek.
 * - CREW: Hanya berhak jika ditunjuk sebagai Lead Planner (projects.leadPlannerId) atau terdaftar dengan role "LEAD_PLANNER".
 */
export async function assertProjectLeadAccess(
  session: UserSession | null,
  projectId: string
): Promise<ActionResponse<void>> {
  if (!session) {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Sesi kerja telah berakhir. Silakan masuk kembali.",
      },
    };
  }

  if (session.role === "OWNER" || session.role === "MANAGEMENT") {
    return { success: true, data: undefined };
  }

  // Cek apakah user adalah Lead Planner proyek
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: { leadPlannerId: true },
  });

  if (project?.leadPlannerId === session.userId) {
    return { success: true, data: undefined };
  }

  // Cek fallback jika ditugaskan sebagai LEAD_PLANNER di project_crews
  const leadAssignment = await db.query.projectCrews.findFirst({
    where: and(
      eq(projectCrews.projectId, projectId),
      eq(projectCrews.userId, session.userId),
      eq(projectCrews.roleInProject, "LEAD_PLANNER")
    ),
    columns: { id: true },
  });

  if (!leadAssignment) {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Wewenang ini hanya dapat diakses oleh Lead Planner (PM) proyek ini atau Manajemen/Owner.",
      },
    };
  }

  return { success: true, data: undefined };
}
