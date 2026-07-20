import { NextRequest } from "next/server";
import { listarOrcamentos, criarOrcamento } from "@/lib/orcamento";
import { verificarToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const payload = verificarToken(authHeader.replace("Bearer ", ""));
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as any;
    const vendedorId = payload.role === "admin" ? undefined : payload.id;

    const orcamentos = await listarOrcamentos({ status, vendedor_id: vendedorId });
    return Response.json(orcamentos);
  } catch (error) {
    console.error("GET /orcamentos error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const payload = verificarToken(authHeader.replace("Bearer ", ""));
    const body = await request.json();
    const orcamento = await criarOrcamento({ ...body, vendedor_id: payload.id });

    return Response.json(orcamento, { status: 201 });
  } catch (error) {
    console.error("POST /orcamentos error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
