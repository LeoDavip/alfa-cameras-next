import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return Response.json({ message: "CRM sync triggered" });
  } catch (error) {
    console.error("POST /crm error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
