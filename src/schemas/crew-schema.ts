import { z } from "zod";

export const crewRoleEnumSchema = z.enum([
  "LEAD_PLANNER",
  "LO_BRIDE",
  "LO_GROOM",
  "LO_FAMILY",
  "RUNNER",
  "LOGISTICS",
  "CEREMONY_OFFICER",
  "USHER",
]);

export const AssignCrewSchema = z.object({
  projectId: z.string().uuid("ID proyek tidak valid"),
  userId: z.string().uuid("ID pengguna tidak valid"),
  roleInProject: z.string().min(2, "Role penugasan wajib diisi"),
  shiftStart: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam mulai harus HH:mm")
    .optional(),
  shiftEnd: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam selesai harus HH:mm")
    .optional(),
});

export const RemoveCrewSchema = z.object({
  assignmentId: z.string().uuid("ID penugasan tidak valid"),
  projectId: z.string().uuid("ID proyek tidak valid"),
});

export type AssignCrewInput = z.infer<typeof AssignCrewSchema>;
export type RemoveCrewInput = z.infer<typeof RemoveCrewSchema>;
export type CrewRole = z.infer<typeof crewRoleEnumSchema>;
