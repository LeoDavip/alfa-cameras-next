import { query } from "@/lib/db";
import { verificarCronAuth } from "@/lib/auth";
import { notify } from "@/lib/telegram";

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'faturado') as faturados FROM orcamentos WHERE created_at > NOW() - INTERVAL '7 days'");
  const total = Number(result.rows[0].total);
  const faturados = Number(result.rows[0].faturados);
  await notify("relatorios", `📊 <b>Relatório Semanal</b>\nTotal de orçamentos: ${total}\nFaturados: ${faturados}`);
  return Response.json({ ok: true, total, faturados });
}
