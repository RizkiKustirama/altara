"use server";

import { db } from "@/db";
import { projects, projectCrews } from "@/db/schema";
import { eq, desc, inArray, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { assertRole, assertProjectAccess } from "@/lib/auth-guard";
import { getSession } from "@/lib/auth";
import { CreateProjectSchema, type CreateProjectInput } from "@/schemas/project-schema";
import type { ActionResponse } from "@/types/action-response";

export interface ProjectItemDTO {
  id: string;
  projectName: string;
  clientGroomName: string;
  clientBrideName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string | null;
  status: string;
  publicToken: string;
  leadPlannerId?: string | null;
  leadPlannerName?: string | null;
  contractAmount?: number;
  crewCount: number;
  createdAt: string;
}

export interface ProjectOverviewDTO {
  id: string;
  projectName: string;
  clientGroomName: string;
  clientBrideName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string | null;
  status: string;
  publicToken: string;
  leadPlannerId?: string | null;
  leadPlannerName?: string | null;
  contractAmount?: number; // Terbuka untuk OWNER, MANAGEMENT, dan LEAD_PLANNER proyek ini
  crewCount: number;
  vendorCount: number;
}

export async function createProjectAction(
  input: CreateProjectInput
): Promise<ActionResponse<{ id: string; publicToken: string; projectName: string }>> {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER", "MANAGEMENT"]);
  if (!auth.success) return auth;

  const parsed = CreateProjectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Input formulir proyek tidak valid.",
        details: parsed.error.flatten(),
      },
    };
  }

  try {
    const publicToken = nanoid(21);

    const [newProject] = await db
      .insert(projects)
      .values({
        projectName: parsed.data.projectName,
        clientGroomName: parsed.data.clientGroomName,
        clientBrideName: parsed.data.clientBrideName,
        weddingDate: parsed.data.weddingDate,
        venueName: parsed.data.venueName,
        venueAddress: parsed.data.venueAddress ?? null,
        contractAmount: String(parsed.data.contractAmount),
        packageId: parsed.data.packageId ?? null,
        leadPlannerId: parsed.data.leadPlannerId ?? null,
        publicToken,
        status: "PLANNING",
      })
      .returning();

    if (!newProject) {
      return {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Gagal menyimpan proyek ke database.",
        },
      };
    }

    // Jika Lead Planner langsung ditunjuk saat registrasi, daftarkan otomatis ke project_crews
    if (parsed.data.leadPlannerId) {
      await db
        .insert(projectCrews)
        .values({
          projectId: newProject.id,
          userId: parsed.data.leadPlannerId,
          eventDate: newProject.weddingDate,
          roleInProject: "LEAD_PLANNER",
        })
        .onConflictDoNothing();
    }

    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return {
      success: true,
      data: {
        id: newProject.id,
        publicToken: newProject.publicToken,
        projectName: newProject.projectName,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal membuat proyek pernikahan baru.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

export async function getProjectsAction(): Promise<ActionResponse<ProjectItemDTO[]>> {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Sesi login Anda telah berakhir. Silakan login kembali.",
      },
    };
  }

  try {
    let projectList;

    if (session.role === "CREW") {
      // Kru dapat melihat proyek jika ditugaskan sebagai staf ATAU ditunjuk sebagai Lead Planner
      const assigned = await db.query.projectCrews.findMany({
        where: eq(projectCrews.userId, session.userId),
        columns: { projectId: true },
      });

      const assignedProjectIds = assigned.map((a) => a.projectId);

      projectList = await db.query.projects.findMany({
        where: or(
          eq(projects.leadPlannerId, session.userId),
          assignedProjectIds.length > 0 ? inArray(projects.id, assignedProjectIds) : undefined
        ),
        with: {
          crews: { columns: { id: true } },
          leadPlanner: { columns: { fullName: true } },
        },
        orderBy: [desc(projects.weddingDate)],
      });
    } else {
      // OWNER & MANAGEMENT melihat seluruh proyek
      projectList = await db.query.projects.findMany({
        with: {
          crews: { columns: { id: true } },
          leadPlanner: { columns: { fullName: true } },
        },
        orderBy: [desc(projects.weddingDate)],
      });
    }

    const result: ProjectItemDTO[] = projectList.map((p) => {
      const isLeadOrManagement =
        session.role === "OWNER" ||
        session.role === "MANAGEMENT" ||
        p.leadPlannerId === session.userId;

      return {
        id: p.id,
        projectName: p.projectName,
        clientGroomName: p.clientGroomName,
        clientBrideName: p.clientBrideName,
        weddingDate: p.weddingDate,
        venueName: p.venueName,
        venueAddress: p.venueAddress,
        status: p.status,
        publicToken: p.publicToken,
        leadPlannerId: p.leadPlannerId,
        leadPlannerName: p.leadPlanner?.fullName ?? null,
        // Privasi finansial: contractAmount hanya terlihat oleh Owner, Management, dan Lead Planner proyek ini
        contractAmount: isLeadOrManagement ? Number(p.contractAmount) : undefined,
        crewCount: p.crews.length,
        createdAt: p.createdAt.toISOString(),
      };
    });

    return { success: true, data: result };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal mengambil daftar proyek.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

export async function getProjectOverviewAction(
  projectId: string
): Promise<ActionResponse<ProjectOverviewDTO>> {
  const session = await getSession();
  const access = await assertProjectAccess(session, projectId);
  if (!access.success) return access;

  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        crews: { columns: { id: true } },
        vendors: { columns: { id: true } },
        leadPlanner: { columns: { fullName: true } },
      },
    });

    if (!project) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Data proyek tidak ditemukan.",
        },
      };
    }

    const isLeadOrManagement =
      session?.role === "OWNER" ||
      session?.role === "MANAGEMENT" ||
      project.leadPlannerId === session?.userId;

    return {
      success: true,
      data: {
        id: project.id,
        projectName: project.projectName,
        clientGroomName: project.clientGroomName,
        clientBrideName: project.clientBrideName,
        weddingDate: project.weddingDate,
        venueName: project.venueName,
        venueAddress: project.venueAddress,
        status: project.status,
        publicToken: project.publicToken,
        leadPlannerId: project.leadPlannerId,
        leadPlannerName: project.leadPlanner?.fullName ?? null,
        contractAmount: isLeadOrManagement ? Number(project.contractAmount) : undefined,
        crewCount: project.crews.length,
        vendorCount: project.vendors.length,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal mengambil ringkasan proyek.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}
