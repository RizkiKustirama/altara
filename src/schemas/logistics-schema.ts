import { z } from "zod";

export const logisticsStatusEnumSchema = z.enum([
  "NOT_RECEIVED",
  "WITH_CREW",
  "AT_STAGE",
  "RETURNED_TO_FAMILY",
]);

export const CreateSacredItemSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  itemName: z.string().min(2, "Nama barang sakral minimal 2 karakter"),
  currentLocation: z.string().min(2, "Lokasi fisik minimal 2 karakter"),
  currentHolderId: z.string().uuid("Format ID kru pemegang tidak valid").optional().nullable(),
  status: logisticsStatusEnumSchema.default("NOT_RECEIVED"),
  notes: z.string().optional().nullable(),
});

export const UpdateSacredItemStatusSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  itemId: z.string().uuid("Format ID barang sakral tidak valid"),
  status: logisticsStatusEnumSchema,
  currentLocation: z.string().optional(),
  currentHolderId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const DeleteSacredItemSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  itemId: z.string().uuid("Format ID barang sakral tidak valid"),
});

export type CreateSacredItemInput = z.infer<typeof CreateSacredItemSchema>;
export type UpdateSacredItemStatusInput = z.infer<typeof UpdateSacredItemStatusSchema>;
export type DeleteSacredItemInput = z.infer<typeof DeleteSacredItemSchema>;
