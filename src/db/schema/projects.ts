import { pgTable, uuid, text, date, numeric, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { servicePackages } from "./supporting-phase2";
import { projectCrews } from "./project-crews";
import { projectVendors } from "./vendors";
import { projectRundowns } from "./rundowns";
import { weddingParties } from "./wedding-parties";
import { sacredBelongings, projectDocuments } from "./supporting-phase2";
import { projectBudgets, paymentMilestones } from "./operational-budgets";
import { companyFinances, crewPayouts } from "./company-finances";

export const projectStatusEnum = pgEnum("project_status", [
  "LEAD",
  "PLANNING",
  "READY",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    packageId: uuid("package_id").references(() => servicePackages.id, { onDelete: "set null" }),
    projectName: text("project_name").notNull(),
    clientGroomName: text("client_groom_name").notNull(),
    clientBrideName: text("client_bride_name").notNull(),
    weddingDate: date("wedding_date").notNull(),
    venueName: text("venue_name").notNull(),
    venueAddress: text("venue_address"),
    
    // Plafon Anggaran Operasional (Tier 1: Terbuka untuk Sarah & Dimas)
    contractAmount: numeric("contract_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    
    // Tautan publik instan tanpa login (Bella & Kevin)
    publicToken: text("public_token").notNull().unique(),
    status: projectStatusEnum("status").notNull().default("PLANNING"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    publicTokenIdx: uniqueIndex("idx_projects_public_token").on(table.publicToken),
    weddingDateIdx: uniqueIndex("idx_projects_wedding_date").on(table.weddingDate, table.id),
  })
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  package: one(servicePackages, { fields: [projects.packageId], references: [servicePackages.id] }),
  crews: many(projectCrews),
  vendors: many(projectVendors),
  rundowns: many(projectRundowns),
  weddingParties: many(weddingParties),
  sacredBelongings: many(sacredBelongings),
  documents: many(projectDocuments),
  budgets: many(projectBudgets),
  milestones: many(paymentMilestones),
  companyFinance: one(companyFinances, {
    fields: [projects.id],
    references: [companyFinances.projectId],
  }),
  crewPayouts: many(crewPayouts),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
