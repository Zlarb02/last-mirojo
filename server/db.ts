import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL must be set for Supabase connection");
}

// Convert Supabase URL to PostgreSQL connection string
const supabaseUrl = new URL(process.env.SUPABASE_URL);
const dbHost = supabaseUrl.hostname;
const dbPort = supabaseUrl.port || "5432";
const dbName = supabaseUrl.pathname.split("/")[1];

const connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${dbHost}:${dbPort}/${dbName}`;

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
export const { users, gameStates } = schema;