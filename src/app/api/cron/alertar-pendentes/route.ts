import { query } from "@/lib/db";
import { verificarCronAuth } from "@/lib/auth";
import { notify } from "@/lib/telegram";

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await query("SELECT COUNT(*) as pendentes FROM orcamentos WHERE status = 'enviado' AND created_at < NOW() - INTERVAL '7 days'");
  const pendentes = Number(result.rows[0].pendentes);
  if (pendentes > 0) {
    await notify("orcamentos", `⏰ <b>Orçamentos Pendentes</b>\n${pendentes} orçamento(s) aguardando há mais de 7 dias.`);
  }
  return Response.json({ ok: true, pendentes });
}
