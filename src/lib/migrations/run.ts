import { Client } from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sqlPath = resolve(__dirname, "001_colunas_faltantes.sql");
  const sql = readFileSync(sqlPath, "utf8");

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    await client.query(sql);
    console.log("Migration 001_colunas_faltantes ran successfully");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
