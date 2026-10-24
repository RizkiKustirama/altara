import { pgTable, uuid, text, time, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { projects } from "./projects";

export const rundownStatusEnum = pgEnum("rundown_status", [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "DELAYED",
]);

export const eventTemplates = pgTable("event_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateName: text("template_name").notNull(),
  ceremonyType: text("ceremony_type").notNull(), // e.g. "ADAT_SUNDA", "HOLY_MATRIMONY", "ADAT_JAWA"
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const templateRundownItems = pgTable("template_rundown_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").notNull().references(() => eventTemplates.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  picRole: text("pic_role"),
  musicCue: text("music_cue"),
  lightingCue: text("lighting_cue"),
});

export const projectRundowns = pgTable("project_rundowns", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  picRole: text("pic_role"),
  musicCue: text("music_cue"),
  lightingCue: text("lighting_cue"),
  status: rundownStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const eventTemplatesRelations = relations(eventTemplates, ({ many }) => ({
  items: many(templateRundownItems),
}));

export const templateRundownItemsRelations = relations(templateRundownItems, ({ one }) => ({
  template: one(eventTemplates, { fields: [templateRundownItems.templateId], references: [eventTemplates.id] }),
}));

export const projectRundownsRelations = relations(projectRundowns, ({ one }) => ({
  project: one(projects, { fields: [projectRundowns.projectId], references: [projects.id] }),
}));

export type EventTemplate = typeof eventTemplates.$inferSelect;
export type TemplateRundownItem = typeof templateRundownItems.$inferSelect;
export type ProjectRundown = typeof projectRundowns.$inferSelect;
