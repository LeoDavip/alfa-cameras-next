import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Usuario } from "@/types";
import { query } from "./db";
import { NextRequest } from "next/server";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const LOGIN_RATE_LIMIT = 5;

export async function verificarRateLimit(email: string): Promise<boolean> {
  const { rows } = await query(
    `SELECT COUNT(*) as count FROM login_attempts
     WHERE email = $1 AND attempted_at > NOW() - INTERVAL '1 minute'`,
    [email]
  );
  return Number(rows[0].count) < LOGIN_RATE_LIMIT;
}

export async function registrarTentativa(email: string, sucesso: boolean) {
  await query(
    "INSERT INTO login_attempts (email, sucesso, attempted_at) VALUES ($1, $2, NOW())",
    [email, sucesso]
  );
}

export function gerarToken(usuario: Pick<Usuario, "id" | "nome" | "email" | "role">): string {
  return jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

export function gerarRefreshToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verificarToken(token: string): jwt.JwtPayload {
  return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
}

export function verificarTokenDeRequest(request: NextRequest): jwt.JwtPayload | null {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return verificarToken(token);
  } catch {
    return null;
  }
}

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export async function compararSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export function verificarCronAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;
  if (!expectedToken || !authHeader) return false;
  return authHeader === `Bearer ${expectedToken}`;
}
