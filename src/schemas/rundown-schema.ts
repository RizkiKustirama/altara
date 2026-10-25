import { z } from "zod";

export const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Format jam harus HH:mm atau HH:mm:ss");

export const rundownStatusEnumSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "DELAYED",
]);

export const CreateRundownItemSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  title: z.string().min(2, "Judul agenda minimal 2 karakter"),
  description: z.string().optional().nullable(),
  startTime: timeStringSchema,
  endTime: timeStringSchema,
  picRole: z.string().optional().nullable(),
  musicCue: z.string().optional().nullable(),
  lightingCue: z.string().optional().nullable(),
  status: rundownStatusEnumSchema.default("PENDING"),
});

export const UpdateRundownItemSchema = z.object({
  itemId: z.string().uuid("Format ID item rundown tidak valid"),
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  title: z.string().min(2, "Judul agenda minimal 2 karakter").optional(),
  description: z.string().optional().nullable(),
  startTime: timeStringSchema.optional(),
  endTime: timeStringSchema.optional(),
  picRole: z.string().optional().nullable(),
  musicCue: z.string().optional().nullable(),
  lightingCue: z.string().optional().nullable(),
  status: rundownStatusEnumSchema.optional(),
  propagateRemaining: z.boolean().default(false),
});

export const DeleteRundownItemSchema = z.object({
  itemId: z.string().uuid("Format ID item rundown tidak valid"),
  projectId: z.string().uuid("Format ID proyek tidak valid"),
});

export const ReorderRundownSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  orderedItemIds: z.array(z.string().uuid("Format item ID tidak valid")).min(1, "Minimal 1 item ID"),
});

export const ShiftRundownTimeSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  startFromIndex: z.number().int().min(0, "Index mulai harus non-negatif"),
  deltaMinutes: z
    .number()
    .int()
    .refine((val) => val !== 0, "Pergeseran menit tidak boleh 0"),
});

export const ApplyTemplateSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  templateId: z.string().uuid("Format ID template tidak valid"),
  customStartTime: timeStringSchema.optional().nullable(),
  replaceExisting: z.boolean().default(true),
});

export type CreateRundownItemInput = z.infer<typeof CreateRundownItemSchema>;
export type UpdateRundownItemInput = z.infer<typeof UpdateRundownItemSchema>;
export type DeleteRundownItemInput = z.infer<typeof DeleteRundownItemSchema>;
export type ReorderRundownInput = z.infer<typeof ReorderRundownSchema>;
export type ShiftRundownTimeInput = z.infer<typeof ShiftRundownTimeSchema>;
export type ApplyTemplateInput = z.infer<typeof ApplyTemplateSchema>;
