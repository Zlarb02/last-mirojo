import "dotenv/config"; // 👈 Charge les variables d’environnement
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Connexion à la base de données Supabase avec SSL obligatoire
const client = postgres(process.env.DATABASE_URL, { ssl: "require" });

export const db = drizzle(client, { schema });
export const { users, gameStates } = schema;
