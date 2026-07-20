import { query } from "@/lib/db";
import { verificarCronAuth } from "@/lib/auth";
import { notify } from "@/lib/telegram";

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await query("WITH expirados AS (UPDATE orcamentos SET status = 'expirado' WHERE status = 'enviado' AND created_at < NOW() - INTERVAL '30 days' RETURNING id) SELECT COUNT(*) as count FROM expirados");
  const count = Number(result.rows[0].count);
  if (count > 0) {
    await notify("logs", `⏳ <b>Orçamentos Expirados</b>\n${count} orçamento(s) expirados automaticamente.`);
  }
  return Response.json({ ok: true, expirados: count });
}
