import { query } from "@/lib/db";
import { verificarCronAuth } from "@/lib/auth";
import { notify } from "@/lib/telegram";

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await query("SELECT NOW() as backup_time");
  await notify("arquivos", `🗄️ <b>Backup Diário</b>\nRealizado em: ${result.rows[0].backup_time}`);
  return Response.json({ ok: true, backup_time: result.rows[0].backup_time });
}
