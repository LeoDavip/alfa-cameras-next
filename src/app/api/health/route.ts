import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT NOW()");
    return Response.json({ status: "ok", time: result.rows[0].now });
  } catch (error) {
    return Response.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
