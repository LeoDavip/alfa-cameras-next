import { NextRequest } from "next/server";
import { queryOne, query } from "@/lib/db";
import { verificarTokenDeRequest } from "@/lib/auth";
import { Plano } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plano = await queryOne<Plano>("SELECT * FROM planos WHERE id = $1", [Number(id)]);
    if (!plano) return Response.json({ error: "Plano não encontrado" }, { status: 404 });
    return Response.json(plano);
  } catch (error) {
    console.error("GET /planos/[id] error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const plano = await queryOne<Plano>(
      `UPDATE planos SET nome = $1, tipo = $2, descricao = $3, preco_mensal = $4, preco_anual = $5, ativo = $6 WHERE id = $7 RETURNING *`,
      [body.nome, body.tipo, body.descricao, body.preco_mensal, body.preco_anual, body.ativo ?? true, Number(id)]
    );

    if (!plano) return Response.json({ error: "Plano não encontrado" }, { status: 404 });
    return Response.json(plano);
  } catch (error) {
    console.error("PUT /planos/[id] error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await query("UPDATE planos SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL", [Number(id)]);
    if ((result.rowCount ?? 0) === 0) {
      return Response.json({ error: "Plano não encontrado" }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("DELETE /planos/[id] error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
