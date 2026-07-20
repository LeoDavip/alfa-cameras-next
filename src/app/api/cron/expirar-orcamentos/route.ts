import { query } from "@/lib/db";
import { verificarCronAuth } from "@/lib/auth";

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await query("UPDATE orcamentos SET status = 'expirado' WHERE status = 'enviado' AND created_at < NOW() - INTERVAL '30 days'");
  return Response.json({ ok: true });
}
