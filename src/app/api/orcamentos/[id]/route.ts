import { NextRequest } from "next/server";
import { buscarOrcamento, atualizarStatus, atualizarOrcamento, excluirOrcamento } from "@/lib/orcamento";
import { verificarTokenDeRequest } from "@/lib/auth";
import { OrcamentoStatus } from "@/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

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
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    const orcamento = await atualizarStatus(Number(id), body.status as OrcamentoStatus);
    if (!orcamento) return Response.json({ error: "Orçamento não encontrado" }, { status: 404 });
    return Response.json(orcamento);
  } catch (error) {
    console.error("PUT /orcamentos/[id] error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    const orcamento = await atualizarOrcamento(Number(id), body);
    if (!orcamento) return Response.json({ error: "Orçamento não encontrado" }, { status: 404 });
    return Response.json(orcamento);
  } catch (error) {
    console.error("PATCH /orcamentos/[id] error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const excluido = await excluirOrcamento(Number(id));
    if (!excluido) return Response.json({ error: "Orçamento não encontrado" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("DELETE /orcamentos/[id] error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
