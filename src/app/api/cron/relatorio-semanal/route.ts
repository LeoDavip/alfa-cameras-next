import { query } from "@/lib/db";
import { verificarCronAuth } from "@/lib/auth";

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'faturado') as faturados FROM orcamentos WHERE created_at > NOW() - INTERVAL '7 days'");
  return Response.json({ ok: true, ...result.rows[0] });
}
