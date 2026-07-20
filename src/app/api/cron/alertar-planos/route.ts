import { query } from "@/lib/db";
import { verificarCronAuth } from "@/lib/auth";
import { notify } from "@/lib/telegram";

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await query("SELECT * FROM planos WHERE ativo = true");
  const planos = result.rows;
  if (planos.length > 0) {
    const texto = planos.map((p: any) => `• ${p.nome} - R$ ${p.preco_mensal}`).join("\n");
    await notify("logs", `📋 <b>Planos Ativos</b>\n${texto}`);
  }
  return Response.json({ ok: true, planos });
}
