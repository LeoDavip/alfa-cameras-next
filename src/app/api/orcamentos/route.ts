import { NextRequest } from "next/server";
import { listarOrcamentos, criarOrcamento } from "@/lib/orcamento";
import { verificarTokenDeRequest } from "@/lib/auth";
import { OrcamentoStatus } from "@/types";
import { notify } from "@/lib/telegram";

export async function GET(request: NextRequest) {
  try {
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") as OrcamentoStatus | null) ?? undefined;
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
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    const orcamento = await criarOrcamento({ ...body, vendedor_id: payload.id });

    notify("orcamentos", `📋 <b>Novo Orçamento #${orcamento.id}</b>\nCliente: ${orcamento.cliente_nome}\nValor: R$ ${orcamento.total.toFixed(2)}\nVendedor: ${payload.nome}`);

    return Response.json(orcamento, { status: 201 });
  } catch (error) {
    console.error("POST /orcamentos error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
