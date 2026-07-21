import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { gerarToken, gerarRefreshToken, hashToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return Response.json({ error: "Refresh token obrigatório" }, { status: 400 });
    }

    const hashed = hashToken(refreshToken);
    const stored = await queryOne<{ usuario_id: number; token_hash: string }>(
      "SELECT * FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()",
      [hashed]
    );

    if (!stored) {
      return Response.json({ error: "Refresh token inválido ou expirado" }, { status: 401 });
    }

    const usuario = await queryOne<{ id: number; nome: string; email: string; role: "admin" | "socio" }>(
      "SELECT id, nome, email, role FROM usuarios WHERE id = $1",
      [stored.usuario_id]
    );

    if (!usuario) {
      return Response.json({ error: "Usuário não encontrado" }, { status: 401 });
    }

    const newToken = gerarToken(usuario);
    const newRefreshToken = gerarRefreshToken();
    const newHashed = hashToken(newRefreshToken);

    await query(
      "DELETE FROM refresh_tokens WHERE usuario_id = $1 AND token_hash = $2",
      [stored.usuario_id, stored.token_hash]
    );

    await queryOne(
      "INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
      [stored.usuario_id, newHashed]
    );

    const response = NextResponse.json({ token: newToken, refreshToken: newRefreshToken });
    response.cookies.set("token", newToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
