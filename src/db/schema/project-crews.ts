import { pgTable, uuid, date, time, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { projects } from "./projects";

export const projectCrews = pgTable(
  "project_crews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
    eventDate: date("event_date").notNull(),
    roleInProject: text("role_in_project").notNull(), // e.g. "LEAD_PLANNER", "LO_BRIDE", "LO_FAMILY", "RUNNER"
    shiftStart: time("shift_start"),
    shiftEnd: time("shift_end"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // CONSTRAINT KRITIS ANTI-BENTROK: 1 kru hanya boleh di 1 tanggal acara
    antiConflictSchedule: unique("unique_crew_event_date").on(table.userId, table.eventDate),
  })
);

export const projectCrewsRelations = relations(projectCrews, ({ one }) => ({
  project: one(projects, { fields: [projectCrews.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectCrews.userId], references: [users.id] }),
}));

export type ProjectCrew = typeof projectCrews.$inferSelect;
export type NewProjectCrew = typeof projectCrews.$inferInsert;
