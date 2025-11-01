import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import "dotenv/config";
import * as schema from "./shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const client = postgres(process.env.DATABASE_URL, {
  max: 1, idle_timeout: 5, connect_timeout: 10, ssl: 'require'
});
export const db = drizzle(client, { schema });
