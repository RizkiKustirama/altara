import { pgTable, uuid, text, boolean, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { projects } from "./projects";
import { users } from "./users";

export const logisticsStatusEnum = pgEnum("logistics_status", [
  "NOT_RECEIVED",
  "WITH_CREW",
  "AT_STAGE",
  "RETURNED_TO_FAMILY",
]);

export const servicePackages = pgTable("service_packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  packageName: text("package_name").notNull(),
  packageType: text("package_type").notNull(), // "DAY_OF_COORDINATION", "FULL_PLANNING"
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  includedServices: text("included_services").notNull(), // JSON / teks deskripsi
  excludedServices: text("excluded_services").notNull(), // Batasan anti scope-creep
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const servicePackagesRelations = relations(servicePackages, ({ many }) => ({
  projects: many(projects),
}));

export const sacredBelongings = pgTable("sacred_belongings", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  itemName: text("item_name").notNull(), // "KOTAK_CINCIN", "BUKU_NIKAH", "MAHAR", "GAUN_GANTI"
  currentLocation: text("current_location").notNull(), // "KAMAR_HOTEL_802", "MEJA_AKAD"
  currentHolderId: uuid("current_holder_id").references(() => users.id, { onDelete: "set null" }),
  status: logisticsStatusEnum("status").notNull().default("NOT_RECEIVED"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sacredBelongingsRelations = relations(sacredBelongings, ({ one }) => ({
  project: one(projects, { fields: [sacredBelongings.projectId], references: [projects.id] }),
  holder: one(users, { fields: [sacredBelongings.currentHolderId], references: [users.id] }),
}));

export const projectDocuments = pgTable("project_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull(), // "LAYOUT_VENUE", "ELECTRICITY_SPEC", "PERMIT"
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: numeric("file_size"),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectDocumentsRelations = relations(projectDocuments, ({ one }) => ({
  project: one(projects, { fields: [projectDocuments.projectId], references: [projects.id] }),
  uploader: one(users, { fields: [projectDocuments.uploadedBy], references: [users.id] }),
}));

export type ServicePackage = typeof servicePackages.$inferSelect;
export type SacredBelonging = typeof sacredBelongings.$inferSelect;
export type ProjectDocument = typeof projectDocuments.$inferSelect;
