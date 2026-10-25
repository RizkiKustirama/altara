import { z } from "zod";

export const paymentStatusEnumSchema = z.enum([
  "PENDING",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
]);

export const positiveAmountSchema = z
  .string()
  .min(1, "Nominal wajib diisi")
  .refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Nominal harus berupa angka non-negatif");

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD");

// -------------------------------------------------------------
// Budget Categories Schemas
// -------------------------------------------------------------

export const CreateBudgetCategorySchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  category: z.string().min(2, "Nama pos/kategori minimal 2 karakter"),
  allocatedAmount: positiveAmountSchema,
  notes: z.string().optional().nullable(),
});

export const UpdateBudgetCategorySchema = z.object({
  budgetId: z.string().uuid("Format ID pos bujet tidak valid"),
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  category: z.string().min(2, "Nama pos/kategori minimal 2 karakter").optional(),
  allocatedAmount: positiveAmountSchema.optional(),
  notes: z.string().optional().nullable(),
});

export const DeleteBudgetCategorySchema = z.object({
  budgetId: z.string().uuid("Format ID pos bujet tidak valid"),
  projectId: z.string().uuid("Format ID proyek tidak valid"),
});

// -------------------------------------------------------------
// Vendor Invoices Schemas
// -------------------------------------------------------------

export const CreateVendorInvoiceSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  projectVendorId: z.string().uuid("Format ID rekanan vendor tidak valid"),
  invoiceNumber: z.string().min(1, "Nomor invoice wajib diisi"),
  totalAmount: positiveAmountSchema,
  dueDate: dateStringSchema,
  status: paymentStatusEnumSchema.default("PENDING"),
  invoiceFileUrl: z.string().url("Format tautan berkas tidak valid").optional().nullable().or(z.literal("")),
});

export const UpdateVendorInvoiceStatusSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  invoiceId: z.string().uuid("Format ID invoice tidak valid"),
  status: paymentStatusEnumSchema,
});

export const DeleteVendorInvoiceSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  invoiceId: z.string().uuid("Format ID invoice tidak valid"),
});

// -------------------------------------------------------------
// Client Payment Milestones Schemas
// -------------------------------------------------------------

export const CreatePaymentMilestoneSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  title: z.string().min(2, "Nama termin (misal: DP 1 / Pelunasan) minimal 2 karakter"),
  amount: positiveAmountSchema,
  dueDate: dateStringSchema,
  paidDate: dateStringSchema.optional().nullable().or(z.literal("")),
  status: paymentStatusEnumSchema.default("PENDING"),
  proofFileUrl: z.string().url("Format tautan bukti tidak valid").optional().nullable().or(z.literal("")),
});

export const UpdatePaymentMilestoneSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  milestoneId: z.string().uuid("Format ID termin tidak valid"),
  title: z.string().min(2).optional(),
  amount: positiveAmountSchema.optional(),
  dueDate: dateStringSchema.optional(),
  paidDate: dateStringSchema.optional().nullable().or(z.literal("")),
  status: paymentStatusEnumSchema.optional(),
  proofFileUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const DeletePaymentMilestoneSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  milestoneId: z.string().uuid("Format ID termin tidak valid"),
});

export type CreateBudgetCategoryInput = z.infer<typeof CreateBudgetCategorySchema>;
export type UpdateBudgetCategoryInput = z.infer<typeof UpdateBudgetCategorySchema>;
export type DeleteBudgetCategoryInput = z.infer<typeof DeleteBudgetCategorySchema>;

export type CreateVendorInvoiceInput = z.infer<typeof CreateVendorInvoiceSchema>;
export type UpdateVendorInvoiceStatusInput = z.infer<typeof UpdateVendorInvoiceStatusSchema>;
export type DeleteVendorInvoiceInput = z.infer<typeof DeleteVendorInvoiceSchema>;

export type CreatePaymentMilestoneInput = z.infer<typeof CreatePaymentMilestoneSchema>;
export type UpdatePaymentMilestoneInput = z.infer<typeof UpdatePaymentMilestoneSchema>;
export type DeletePaymentMilestoneInput = z.infer<typeof DeletePaymentMilestoneSchema>;
