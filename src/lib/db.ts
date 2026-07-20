import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return { rows: res.rows, rowCount: res.rowCount, duration };
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const res = await query(text, params);
  return (res.rows[0] as T) ?? null;
}

export async function queryMany<T>(text: string, params?: unknown[]): Promise<T[]> {
  const res = await query(text, params);
  return res.rows as T[];
}

export { pool };
