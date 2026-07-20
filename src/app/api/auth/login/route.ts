import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { compararSenha, gerarToken, gerarRefreshToken, hashToken, verificarRateLimit, registrarTentativa } from "@/lib/auth";
import { Usuario } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatórios" }, { status: 400 });
    }

    if (!(await verificarRateLimit(email))) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde 1 minuto." }, { status: 429 });
    }

    const usuario = await queryOne<Usuario & { senha_hash: string }>(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (!usuario || !(await compararSenha(password, usuario.senha_hash))) {
      await registrarTentativa(email, false);
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    await registrarTentativa(email, true);

    const token = gerarToken(usuario);
    const refreshToken = gerarRefreshToken();
    const hashedRefreshToken = hashToken(refreshToken);

    await queryOne(
      "INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
      [usuario.id, hashedRefreshToken]
    );

    const response = NextResponse.json({
      token,
      refreshToken,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
