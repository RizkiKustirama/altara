import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config();

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/altara_wo";

// Client for queries
const client = postgres(connectionString, {
  max: process.env.NODE_ENV === "production" ? 10 : 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export type DatabaseInstance = typeof db;
