import { z } from "zod";

export const positiveNumericString = z
  .string()
  .min(1, "Nominal wajib diisi")
  .refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Nominal harus berupa angka non-negatif");

export const BatchCrewPayoutSchema = z.object({
  payoutIds: z.array(z.string().uuid("Format ID honor tidak valid")).min(1, "Pilih minimal 1 honor kru untuk dicairkan"),
  paymentReference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const RecordCrewPayoutSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  userId: z.string().uuid("Format ID kru tidak valid"),
  dailyRate: positiveNumericString,
  sessionCount: z
    .string()
    .default("1.0")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Jumlah sesi harus lebih dari 0"),
  notes: z.string().optional().nullable(),
});

export const UpdateCompanyFinanceSchema = z.object({
  projectId: z.string().uuid("Format ID proyek tidak valid"),
  notes: z.string().optional().nullable(),
});

export type BatchCrewPayoutInput = z.infer<typeof BatchCrewPayoutSchema>;
export type RecordCrewPayoutInput = z.infer<typeof RecordCrewPayoutSchema>;
export type UpdateCompanyFinanceInput = z.infer<typeof UpdateCompanyFinanceSchema>;
