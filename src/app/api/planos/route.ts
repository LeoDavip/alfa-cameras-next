import { NextRequest } from "next/server";
import { queryMany, queryOne } from "@/lib/db";
import { verificarTokenDeRequest } from "@/lib/auth";
import { Plano } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const planos = await queryMany<Plano>("SELECT * FROM planos WHERE ativo = true ORDER BY preco_mensal");
    return Response.json(planos);
  } catch (error) {
    console.error("GET /planos error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    const plano = await queryOne<Plano>(
      `INSERT INTO planos (nome, tipo, descricao, preco_mensal, preco_anual, ativo)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
      [body.nome, body.tipo, body.descricao, body.preco_mensal, body.preco_anual]
    );

    return Response.json(plano, { status: 201 });
  } catch (error) {
    console.error("POST /planos error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
