import { pgTable, uuid, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { projects } from "./projects";
import { vendorInvoices } from "./operational-budgets";

export const vendorCategoryEnum = pgEnum("vendor_category", [
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

export const contractStatusEnum = pgEnum("contract_status", [
  "INQUIRY",
  "BOOKED",
  "DP_PAID",
  "SETTLED",
  "CANCELLED",
]);

export const vendors = pgTable("vendors", {
  id: uuid("id").defaultRandom().primaryKey(),
  vendorName: text("vendor_name").notNull(),
  category: vendorCategoryEnum("category").notNull(),
  picName: text("pic_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectVendors = pgTable("project_vendors", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  vendorId: uuid("vendor_id").notNull().references(() => vendors.id, { onDelete: "restrict" }),
  category: vendorCategoryEnum("category").notNull(),
  contractStatus: contractStatusEnum("contract_status").notNull().default("INQUIRY"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const vendorsRelations = relations(vendors, ({ many }) => ({
  projectAssignments: many(projectVendors),
}));

export const projectVendorsRelations = relations(projectVendors, ({ one, many }) => ({
  project: one(projects, { fields: [projectVendors.projectId], references: [projects.id] }),
  vendor: one(vendors, { fields: [projectVendors.vendorId], references: [vendors.id] }),
  invoices: many(vendorInvoices),
}));

export type Vendor = typeof vendors.$inferSelect;
export type ProjectVendor = typeof projectVendors.$inferSelect;
