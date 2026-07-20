import { query } from "@/lib/db";
import { verificarCronAuth } from "@/lib/auth";

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await query("SELECT NOW() as sync_time");
  return Response.json({ ok: true, sync_time: result.rows[0].sync_time });
}
