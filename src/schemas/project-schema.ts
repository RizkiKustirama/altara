import { z } from "zod";

export const projectStatusEnumSchema = z.enum([
  "LEAD",
  "PLANNING",
  "READY",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const CreateProjectSchema = z.object({
  packageId: z.string().uuid("Format ID paket tidak valid").optional(),
  projectName: z.string().min(3, "Nama proyek minimal 3 karakter"),
  clientGroomName: z.string().min(2, "Nama pengantin pria wajib diisi"),
  clientBrideName: z.string().min(2, "Nama pengantin wanita wajib diisi"),
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  venueName: z.string().min(3, "Nama venue wajib diisi"),
  venueAddress: z.string().optional(),
  contractAmount: z.number().nonnegative("Nilai kontrak tidak boleh negatif").default(0),
});

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  id: z.string().uuid("ID proyek wajib berupa UUID"),
  status: projectStatusEnumSchema.optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ProjectStatus = z.infer<typeof projectStatusEnumSchema>;
