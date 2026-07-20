import { query } from "@/lib/db";
import { verificarCronAuth } from "@/lib/auth";

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await query("SELECT * FROM planos WHERE ativo = true");
  return Response.json({ ok: true, planos: result.rows });
}
