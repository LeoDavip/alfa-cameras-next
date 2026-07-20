import { NextRequest } from "next/server";
import { queryMany } from "@/lib/db";
import { verificarToken } from "@/lib/auth";
import { Produto } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "N\u00e3o autenticado" }, { status: 401 });
    verificarToken(authHeader.replace("Bearer ", ""));

    const { searchParams } = new URL(request.url);
    const marca = searchParams.get("marca");
    let sql = "SELECT * FROM produtos WHERE 1=1";
    const params: unknown[] = [];

    if (marca) {
      sql += " AND marca = $1";
      params.push(marca);
    }
    sql += " ORDER BY nome";

    const produtos = await queryMany<Produto>(sql, params);
    return Response.json(produtos);
  } catch (error) {
    console.error("GET /produtos error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
