import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { projects } from "./projects";

export const weddingParties = pgTable("wedding_parties", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(), // e.g. "AYAH_PENGANTIN_WANITA", "SAKSI_NIKAH_PRIA", "VIP"
  phone: text("phone"),
  ceremonialRole: text("ceremonial_role"), // e.g. "Saksi Nikah", "Pemberi Sambutan", "Juru Bicara"
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const weddingPartiesRelations = relations(weddingParties, ({ one }) => ({
  project: one(projects, { fields: [weddingParties.projectId], references: [projects.id] }),
}));

export type WeddingParty = typeof weddingParties.$inferSelect;
export type NewWeddingParty = typeof weddingParties.$inferInsert;
