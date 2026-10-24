import { pgTable, uuid, numeric, text, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { projects } from "./projects";
import { users } from "./users";

export const payoutStatusEnum = pgEnum("payout_status", ["PENDING", "PAID"]);

// Dapur Bisnis: 1-to-1 dengan Projects (Hanya Dimas yang berhak query tabel ini)
export const companyFinances = pgTable(
  "company_finances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().unique().references(() => projects.id, { onDelete: "cascade" }),
    grossContractPrice: numeric("gross_contract_price", { precision: 12, scale: 2 }).notNull(),
    vendorRealCost: numeric("vendor_real_cost", { precision: 12, scale: 2 }).notNull().default("0"),
    crewTotalExpense: numeric("crew_total_expense", { precision: 12, scale: 2 }).notNull().default("0"),
    netProfitMargin: numeric("net_profit_margin", { precision: 12, scale: 2 }).notNull().default("0"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectFinanceIdx: uniqueIndex("idx_company_finances_project_id").on(table.projectId),
  })
);

// Kalkulator & Rekapitulasi Honor Harian Kru (Owner-Only)
export const crewPayouts = pgTable("crew_payouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  dailyRate: numeric("daily_rate", { precision: 10, scale: 2 }).notNull(),
  sessionCount: numeric("session_count", { precision: 4, scale: 1 }).notNull().default("1.0"),
  totalPayout: numeric("total_payout", { precision: 10, scale: 2 }).notNull(),
  payoutStatus: payoutStatusEnum("payout_status").notNull().default("PENDING"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const companyFinancesRelations = relations(companyFinances, ({ one }) => ({
  project: one(projects, { fields: [companyFinances.projectId], references: [projects.id] }),
}));

export const crewPayoutsRelations = relations(crewPayouts, ({ one }) => ({
  project: one(projects, { fields: [crewPayouts.projectId], references: [projects.id] }),
  crew: one(users, { fields: [crewPayouts.userId], references: [users.id] }),
}));

export type CompanyFinance = typeof companyFinances.$inferSelect;
export type CrewPayout = typeof crewPayouts.$inferSelect;
