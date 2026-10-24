import { pgTable, uuid, text, numeric, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { projects } from "./projects";
import { projectVendors } from "./vendors";

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
]);

export const projectBudgets = pgTable("project_budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // "VENUE", "CATERING", "DECOR"
  allocatedAmount: numeric("allocated_amount", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const vendorInvoices = pgTable("vendor_invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectVendorId: uuid("project_vendor_id").notNull().references(() => projectVendors.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  status: paymentStatusEnum("status").notNull().default("PENDING"),
  invoiceFileUrl: text("invoice_file_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentMilestones = pgTable("payment_milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // "DP 1 (Booking)", "DP 2", "Pelunasan"
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  paidDate: date("paid_date"),
  status: paymentStatusEnum("status").notNull().default("PENDING"),
  proofFileUrl: text("proof_file_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const operationalBudgetsRelations = relations(projectBudgets, ({ one }) => ({
  project: one(projects, { fields: [projectBudgets.projectId], references: [projects.id] }),
}));

export const vendorInvoicesRelations = relations(vendorInvoices, ({ one }) => ({
  projectVendor: one(projectVendors, { fields: [vendorInvoices.projectVendorId], references: [projectVendors.id] }),
}));

export const paymentMilestonesRelations = relations(paymentMilestones, ({ one }) => ({
  project: one(projects, { fields: [paymentMilestones.projectId], references: [projects.id] }),
}));

export type ProjectBudget = typeof projectBudgets.$inferSelect;
export type VendorInvoice = typeof vendorInvoices.$inferSelect;
export type PaymentMilestone = typeof paymentMilestones.$inferSelect;
