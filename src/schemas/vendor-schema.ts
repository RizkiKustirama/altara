import { z } from "zod";

export const vendorCategoryEnumSchema = z.enum([
  "MUA",
  "DECORATION",
  "CATERING",
  "PHOTO_VIDEO",
  "SOUND_LIGHTING",
  "VENUE",
  "MC",
  "ATTIRE",
  "ENTERTAINMENT",
  "OTHER",
]);

export const contractStatusEnumSchema = z.enum([
  "INQUIRY",
  "BOOKED",
  "DP_PAID",
  "SETTLED",
  "CANCELLED",
]);

export const CreateVendorSchema = z.object({
  vendorName: z.string().min(2, "Nama vendor minimal 2 karakter"),
  category: vendorCategoryEnumSchema,
  picName: z.string().min(2, "Nama PIC vendor wajib diisi"),
  phone: z.string().min(8, "Nomor telepon PIC minimal 8 karakter"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const UpdateVendorSchema = CreateVendorSchema.partial().extend({
  id: z.string().uuid("Format ID vendor tidak valid"),
});

export const SlotVendorSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  vendorId: z.string().uuid("Format ID vendor tidak valid"),
  category: vendorCategoryEnumSchema,
  contractStatus: contractStatusEnumSchema.default("INQUIRY"),
  notes: z.string().optional(),
});

export const UpdateVendorSlotSchema = z.object({
  slotId: z.string().uuid("Format ID slot tidak valid"),
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  contractStatus: contractStatusEnumSchema.optional(),
  notes: z.string().optional(),
});

export type VendorCategory = z.infer<typeof vendorCategoryEnumSchema>;
export type ContractStatus = z.infer<typeof contractStatusEnumSchema>;
export type CreateVendorInput = z.infer<typeof CreateVendorSchema>;
export type UpdateVendorInput = z.infer<typeof UpdateVendorSchema>;
export type SlotVendorInput = z.infer<typeof SlotVendorSchema>;
export type UpdateVendorSlotInput = z.infer<typeof UpdateVendorSlotSchema>;
