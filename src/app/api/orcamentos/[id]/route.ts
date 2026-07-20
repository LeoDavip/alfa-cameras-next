import { NextRequest } from "next/server";
import { buscarOrcamento, atualizarStatus } from "@/lib/orcamento";
import { verificarToken } from "@/lib/auth";
import { OrcamentoStatus } from "@/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Não autenticado" }, { status: 401 });
    verificarToken(authHeader.replace("Bearer ", ""));

    const orcamento = await buscarOrcamento(Number(id));
    if (!orcamento) return Response.json({ error: "Orçamento não encontrado" }, { status: 404 });
    return Response.json(orcamento);
  } catch (error) {
    console.error("GET /orcamentos/[id] error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Não autenticado" }, { status: 401 });
    verificarToken(authHeader.replace("Bearer ", ""));

    const body = await request.json();
    const orcamento = await atualizarStatus(Number(id), body.status as OrcamentoStatus);
    if (!orcamento) return Response.json({ error: "Orçamento não encontrado" }, { status: 404 });
    return Response.json(orcamento);
  } catch (error) {
    console.error("PUT /orcamentos/[id] error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
