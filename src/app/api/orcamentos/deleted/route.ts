import { NextRequest } from "next/server";
import { listarOrcamentosDeletados, restaurarOrcamento } from "@/lib/orcamento";
import { verificarTokenDeRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });
    if (payload.role !== "admin") return Response.json({ error: "Apenas admin" }, { status: 403 });

    const orcamentos = await listarOrcamentosDeletados();
    return Response.json(orcamentos);
  } catch (error) {
    console.error("GET /orcamentos/deleted error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });
    if (payload.role !== "admin") return Response.json({ error: "Apenas admin" }, { status: 403 });

    const { id } = await request.json();
    if (!id || isNaN(Number(id))) {
      return Response.json({ error: "ID inválido" }, { status: 400 });
    }
    const orcamento = await restaurarOrcamento(Number(id));
    if (!orcamento) return Response.json({ error: "Orçamento não encontrado" }, { status: 404 });
    return Response.json(orcamento);
  } catch (error) {
    console.error("POST /orcamentos/deleted error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
