import { z } from "zod";

export const relationshipEnumSchema = z.enum([
  "AYAH_CPW",
  "IBU_CPW",
  "AYAH_CPP",
  "IBU_CPP",
  "SAKSI_NIKAH_CPW",
  "SAKSI_NIKAH_CPP",
  "PENGIRING_BRIDESMAID",
  "PENGIRING_GROOMSMEN",
  "VIP",
  "KELUARGA_BESAR",
  "OTHER",
]);

export const CreateWeddingPartyMemberSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  name: z.string().min(2, "Nama anggota keluarga minimal 2 karakter"),
  relationship: relationshipEnumSchema,
  phone: z
    .string()
    .min(8, "Nomor telepon minimal 8 karakter")
    .optional()
    .nullable()
    .or(z.literal("")),
  ceremonialRole: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const UpdateWeddingPartyMemberSchema = z.object({
  id: z.string().uuid("Format ID anggota tidak valid"),
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  name: z.string().min(2, "Nama anggota keluarga minimal 2 karakter").optional(),
  relationship: relationshipEnumSchema.optional(),
  phone: z
    .string()
    .min(8, "Nomor telepon minimal 8 karakter")
    .optional()
    .nullable()
    .or(z.literal("")),
  ceremonialRole: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const DeleteWeddingPartyMemberSchema = z.object({
  id: z.string().uuid("Format ID anggota tidak valid"),
  projectId: z.string().uuid("Format ID proyek tidak valid"),
});

export type RelationshipType = z.infer<typeof relationshipEnumSchema>;
export type CreateWeddingPartyMemberInput = z.infer<typeof CreateWeddingPartyMemberSchema>;
export type UpdateWeddingPartyMemberInput = z.infer<typeof UpdateWeddingPartyMemberSchema>;
export type DeleteWeddingPartyMemberInput = z.infer<typeof DeleteWeddingPartyMemberSchema>;
