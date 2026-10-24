import { pgTable, uuid, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { projectCrews } from "./project-crews";
import { sacredBelongings, projectDocuments } from "./supporting-phase2";
import { crewPayouts } from "./company-finances";

export const userRoleEnum = pgEnum("user_role", ["OWNER", "PLANNER", "CREW"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("CREW"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projectAssignments: many(projectCrews),
  heldLogistics: many(sacredBelongings),
  uploadedDocuments: many(projectDocuments),
  payouts: many(crewPayouts),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
