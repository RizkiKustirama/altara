import { db } from "@/db";
import { projectCrews, projects, users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import type { ActionResponse } from "@/types/action-response";
import type { AssignCrewInput } from "@/schemas/crew-schema";

export interface CrewAvailabilityCheckResult {
  isAvailable: boolean;
  conflictingProjectName?: string;
  conflictingProjectId?: string;
  crewName?: string;
}

export interface CrewAssignmentDTO {
  assignmentId: string;
  projectId: string;
  userId: string;
  crewName: string;
  crewEmail: string;
  crewPhone: string;
  eventDate: string;
  roleInProject: string;
  shiftStart: string | null;
  shiftEnd: string | null;
}

export async function checkCrewAvailability(
  userId: string,
  eventDate: string,
  excludeProjectId?: string
): Promise<CrewAvailabilityCheckResult> {
  const conditions = [
    eq(projectCrews.userId, userId),
    eq(projectCrews.eventDate, eventDate),
  ];

  if (excludeProjectId) {
    conditions.push(ne(projectCrews.projectId, excludeProjectId));
  }

  const existing = await db.query.projectCrews.findFirst({
    where: and(...conditions),
    with: {
      project: {
        columns: { id: true, projectName: true },
      },
      user: {
        columns: { fullName: true },
      },
    },
  });

  if (existing) {
    return {
      isAvailable: false,
      conflictingProjectId: existing.projectId,
      conflictingProjectName: existing.project?.projectName ?? "proyek lain",
      crewName: existing.user?.fullName ?? "Kru",
    };
  }

  return { isAvailable: true };
}

export async function assignCrewToProject(
  input: AssignCrewInput
): Promise<ActionResponse<CrewAssignmentDTO>> {
  try {
    // 1. Ambil data proyek untuk mendapatkan tanggal acara (weddingDate)
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, input.projectId),
      columns: { id: true, weddingDate: true, projectName: true },
    });

    if (!project) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Data proyek pernikahan tidak ditemukan.",
        },
      };
    }

    // 2. Pemeriksaan Preventif Anti-Bentrok Jadwal pada Application/Service Layer
    const availability = await checkCrewAvailability(
      input.userId,
      project.weddingDate,
      input.projectId
    );

    if (!availability.isAvailable) {
      const crewName = availability.crewName ?? "Kru";
      const conflictProject = availability.conflictingProjectName ?? "proyek lain";

      return {
        success: false,
        error: {
          code: "CONFLICT_SCHEDULE",
          message: `${crewName} sudah terjadwal bertugas di ${conflictProject} pada tanggal ${project.weddingDate}.`,
          details: {
            conflictingProjectId: availability.conflictingProjectId,
            eventDate: project.weddingDate,
            userId: input.userId,
          },
        },
      };
    }

    // 3. Simpan penugasan baru ke database
    const [newAssignment] = await db
      .insert(projectCrews)
      .values({
        projectId: input.projectId,
        userId: input.userId,
        eventDate: project.weddingDate,
        roleInProject: input.roleInProject,
        shiftStart: input.shiftStart ?? null,
        shiftEnd: input.shiftEnd ?? null,
      })
      .returning();

    if (!newAssignment) {
      return {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Gagal menyimpan penugasan kru ke database.",
        },
      };
    }

    // 4. Ambil profil kru untuk merespons dengan DTO lengkap
    const userProfile = await db.query.users.findFirst({
      where: eq(users.id, input.userId),
      columns: { fullName: true, email: true, phone: true },
    });

    return {
      success: true,
      data: {
        assignmentId: newAssignment.id,
        projectId: newAssignment.projectId,
        userId: newAssignment.userId,
        crewName: userProfile?.fullName ?? "Kru",
        crewEmail: userProfile?.email ?? "",
        crewPhone: userProfile?.phone ?? "",
        eventDate: newAssignment.eventDate,
        roleInProject: newAssignment.roleInProject,
        shiftStart: newAssignment.shiftStart,
        shiftEnd: newAssignment.shiftEnd,
      },
    };
  } catch (err: unknown) {
    // Fallback: Tangkap kegagalan database unique constraint "unique_crew_event_date"
    const dbError = err as { code?: string; constraint?: string; message?: string };
    if (dbError.constraint === "unique_crew_event_date" || dbError.code === "23505") {
      return {
        success: false,
        error: {
          code: "CONFLICT_SCHEDULE",
          message: "Kru tersebut sudah ditugaskan pada tanggal acara yang sama (Constraint Database).",
          details: dbError.message,
        },
      };
    }

    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal menugaskan kru ke proyek pernikahan.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

export async function removeCrewFromProject(
  assignmentId: string,
  projectId: string
): Promise<ActionResponse<{ deletedId: string }>> {
  try {
    const deleted = await db
      .delete(projectCrews)
      .where(
        and(
          eq(projectCrews.id, assignmentId),
          eq(projectCrews.projectId, projectId)
        )
      )
      .returning({ id: projectCrews.id });

    if (!deleted.length || !deleted[0]) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Data penugasan kru tidak ditemukan.",
        },
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
        message: "Gagal membatalkan penugasan kru.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

export async function getProjectCrews(
  projectId: string
): Promise<ActionResponse<CrewAssignmentDTO[]>> {
  try {
    const list = await db.query.projectCrews.findMany({
      where: eq(projectCrews.projectId, projectId),
      with: {
        user: {
          columns: { fullName: true, email: true, phone: true },
        },
      },
      orderBy: [projectCrews.createdAt],
    });

    return {
      success: true,
      data: list.map((item) => ({
        assignmentId: item.id,
        projectId: item.projectId,
        userId: item.userId,
        crewName: item.user?.fullName ?? "Kru",
        crewEmail: item.user?.email ?? "",
        crewPhone: item.user?.phone ?? "",
        eventDate: item.eventDate,
        roleInProject: item.roleInProject,
        shiftStart: item.shiftStart,
        shiftEnd: item.shiftEnd,
      })),
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal mengambil daftar kru proyek.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}
