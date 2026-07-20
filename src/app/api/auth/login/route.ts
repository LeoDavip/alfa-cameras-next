import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { compararSenha, gerarToken, gerarRefreshToken, hashToken, verificarRateLimit, verificarLockout, registrarTentativa, limparTentativas } from "@/lib/auth";
import { Usuario } from "@/types";

function redirectToLogin(error: string, request: NextRequest): NextResponse {
  const base = new URL(request.url);
  return NextResponse.redirect(new URL(`/login?error=${error}`, base.origin));
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let email: string, password: string;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } else {
      const form = await request.formData();
      email = form.get("email") as string;
      password = form.get("password") as string;
    }

    email = (email || "").trim().toLowerCase();
    password = password || "";

    if (!email || !password) {
      return redirectToLogin("required", request);
    }

    if (!(await verificarRateLimit(email))) {
      return redirectToLogin("rate_limit", request);
    }

    if (!(await verificarLockout(email))) {
      return redirectToLogin("locked", request);
    }

    const usuario = await queryOne<Usuario & { senha_hash: string }>(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (!usuario || !(await compararSenha(password, usuario.senha_hash))) {
      await registrarTentativa(email, false);
      return redirectToLogin("invalid", request);
    }

    await limparTentativas(email);
    await registrarTentativa(email, true);

    const token = gerarToken(usuario);
    const refreshToken = gerarRefreshToken();
    const hashedRefreshToken = hashToken(refreshToken);

    await queryOne(
      "INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
      [usuario.id, hashedRefreshToken]
    );

    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    if (acceptsHtml) {
      const response = new Response(null, { status: 302, headers: { location: "/dashboard" } });
      response.headers.set("set-cookie", `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`);
      return response;
    }

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
    return redirectToLogin("internal", request);
  }
}
