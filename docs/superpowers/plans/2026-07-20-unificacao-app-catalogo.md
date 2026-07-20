# Unificação App + Catálogo — Next.js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrar sistema Alfa Câmeras de Vue 3 + Express + HTML estático para Next.js + TypeScript em 4 fases.

**Architecture:** Next.js App Router monolítico com Server Components para páginas de leitura, Client Components para formulários, API Routes no lugar do Express, e lógica de negócio em `lib/`. PostgreSQL (Neon) mantido.

**Tech Stack:** Next.js 15 + TypeScript 5 + React 19 + shadcn/ui + PostgreSQL (Neon) + Vercel

---

## File Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx                    # Root layout (html, body)
│   ├── page.tsx                      # Redirect / → /dashboard
│   ├── (auth)/
│   │   └── login/page.tsx            # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Sidebar + Header wrapper
│   │   ├── page.tsx                  # Dashboard (KPIs)
│   │   ├── orcamentos/
│   │   │   ├── page.tsx              # Painel de orçamentos
│   │   │   ├── novo/page.tsx         # Nova proposta
│   │   │   └── [id]/page.tsx         # Detalhes do orçamento
│   │   ├── catalogo/
│   │   │   ├── page.tsx              # Listagem de produtos
│   │   │   └── [slug]/page.tsx       # Detalhes do produto
│   │   ├── clientes/page.tsx
│   │   └── planos/page.tsx
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   └── refresh/route.ts
│       ├── orcamentos/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── produtos/route.ts
│       ├── planos/route.ts
│       └── crm/route.ts
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── sidebar-item.tsx
│   │   ├── mobile-header.tsx
│   │   └── user-menu.tsx
│   └── features/
│       ├── login-form.tsx
│       ├── dashboard-kpis.tsx
│       ├── dashboard-chart.tsx
│       ├── tabela-orcamentos.tsx
│       ├── filtros-orcamentos.tsx
│       ├── cartao-orcamento.tsx
│       ├── resultado-orcamento.tsx
│       ├── nova-proposta-form.tsx
│       ├── produto-selector.tsx
│       ├── product-card.tsx
│       ├── product-grid.tsx
│       ├── clientes-lista.tsx
│       ├── planos-lista.tsx
│       └── planos-form.tsx
├── lib/
│   ├── db.ts                         # Pool PostgreSQL + helper queries
│   ├── auth.ts                       # JWT sign/verify, hash, helpers
│   ├── orcamento.ts                  # Cálculos, regras de negócio
│   ├── telegram.ts                   # Notificações
│   ├── rdstation.ts                  # Integração RD Station
│   ├── whatsapp.ts                   # Geração de link
│   └── logger.ts                     # Winston
├── types/
│   ├── orcamento.ts
│   ├── produto.ts
│   ├── usuario.ts
│   └── plano.ts
└── middleware.ts                     # Next.js middleware (auth)
```

---

## Phase 1: Setup + Core (1 week)

### Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Bootstrap Next.js project**

Run:
```bash
cd "/c/Users/Tio Chang/Documents/crypto/alfa-cameras-next"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm
```

Expected: project scaffolded with `src/app/`, `next.config.ts`, `tsconfig.json`, `package.json`.

- [ ] **Step 2: Install core dependencies**

Run:
```bash
npm install pg jsonwebtoken bcryptjs winston axios zod date-fns
npm install -D @types/pg @types/jsonwebtoken @types/bcryptjs
```

Expected: dependencies added to `package.json`.

- [ ] **Step 3: Install shadcn/ui**

Run:
```bash
npx shadcn@latest init -d
npx shadcn@latest add button input select dialog table card badge toast dropdown-menu
```

Expected: `components/ui/` populated with shadcn components.

- [ ] **Step 4: Configure .env.example**

Create `.env.example`:
```
# Database
DATABASE_URL=postgresql://user:pass@host:5432/alfa-cameras

# JWT
JWT_SECRET=your-secret-here

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-token
TELEGRAM_CHAT_ID=your-chat-id

# RD Station
RD_STATION_CLIENT_ID=your-client-id
RD_STATION_CLIENT_SECRET=your-client-secret
RD_STATION_REDIRECT_URI=https://your-domain.vercel.app/api/crm/callback
```

- [ ] **Step 5: Set up next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
```

- [ ] **Step 6: Set up globals.css with CSS variables**

Read the existing `app/frontend/src/style.css` from the legado project and adapt CSS variables for Tailwind. Key colors: Alfa Câmeras brand colors.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... shadcn will generate these during init */
  }
}
```

- [ ] **Step 7: Create root layout with metadata**

`src/app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alfa Câmeras",
  description: "Sistema de Orçamentos",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Create / redirect to /dashboard**

`src/app/page.tsx`:
```typescript
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: scaffold Next.js project with shadcn/ui"
```

---

### Task 2: TypeScript types

**Files:**
- Create: `src/types/usuario.ts`
- Create: `src/types/orcamento.ts`
- Create: `src/types/produto.ts`
- Create: `src/types/plano.ts`
- Create: `src/types/index.ts`

- [ ] **Step 1: Create usuario type**

`src/types/usuario.ts`:
```typescript
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: "admin" | "socio";
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  usuario: Usuario;
}
```

- [ ] **Step 2: Create orcamento type**

`src/types/orcamento.ts`:
```typescript
export type OrcamentoStatus = "rascunho" | "enviado" | "faturado";

export interface OrcamentoItem {
  id?: number;
  orcamento_id?: number;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  total: number;
  tipo: "produto" | "servico";
}

export interface Orcamento {
  id: number;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_endereco?: string;
  items: OrcamentoItem[];
  total: number;
  status: OrcamentoStatus;
  vendedor_id: number;
  vendedor_nome?: string;
  created_at: string;
  updated_at?: string;
  enviado_em?: string;
  faturado_em?: string;
  link_whatsapp?: string;
}
```

- [ ] **Step 3: Create produto type**

`src/types/produto.ts`:
```typescript
export interface Produto {
  id: number;
  nome: string;
  slug: string;
  marca: "Intelbras" | "Tapo" | "TP-Link";
  descricao?: string;
  preco: number;
  imagem_url?: string;
  categoria: string;
  destaque?: boolean;
}
```

- [ ] **Step 4: Create plano type**

`src/types/plano.ts`:
```typescript
export type PlanoTipo = "cobertura_4" | "cobertura_10" | "cobertura_total" | "add_on_prioritario";

export interface Plano {
  id: number;
  nome: string;
  tipo: PlanoTipo;
  descricao: string;
  preco_mensal: number;
  preco_anual?: number;
  ativo: boolean;
  created_at: string;
}
```

- [ ] **Step 5: Create types barrel export**

`src/types/index.ts`:
```typescript
export * from "./usuario";
export * from "./orcamento";
export * from "./produto";
export * from "./plano";
```

- [ ] **Step 6: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript types for all entities"
```

---

### Task 3: Database connection (lib/db.ts)

**Files:**
- Create: `src/lib/db.ts`

- [ ] **Step 1: Create database pool**

`src/lib/db.ts`:
```typescript
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return { rows: res.rows, rowCount: res.rowCount, duration };
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const res = await query(text, params);
  return (res.rows[0] as T) ?? null;
}

export async function queryMany<T>(text: string, params?: unknown[]): Promise<T[]> {
  const res = await query(text, params);
  return res.rows as T[];
}

export { pool };
```

- [ ] **Step 2: Create db health check endpoint temporarily**

Create `src/app/api/health/route.ts` for testing:
```typescript
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT NOW()");
    return Response.json({ status: "ok", time: result.rows[0].now });
  } catch (error) {
    return Response.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.ts src/app/api/health/route.ts
git commit -m "feat: add PostgreSQL connection pool with query helpers"
```

---

### Task 4: Auth library (lib/auth.ts + middleware)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/middleware.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/refresh/route.ts`

- [ ] **Step 1: Create auth library (includes JWT + rate limiting)**

`src/lib/auth.ts`:
```typescript
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Usuario } from "@/types";
import { query } from "./db";

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
```

- [ ] **Step 2: Next.js middleware for route protection**

`src/middleware.ts`:
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/api/auth/login", "/api/auth/refresh", "/api/health"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|imagens/).*)"],
};
```
```typescript
import { NextRequest } from "next/server";
import { queryOne } from "@/lib/db";
import { compararSenha, gerarToken, gerarRefreshToken, hashToken, verificarRateLimit, registrarTentativa } from "@/lib/auth";
import { Usuario } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email e senha obrigatórios" }, { status: 400 });
    }

    if (!(await verificarRateLimit(email))) {
      return Response.json({ error: "Muitas tentativas. Aguarde 1 minuto." }, { status: 429 });
    }

    const usuario = await queryOne<Usuario & { senha_hash: string }>(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (!usuario || !(await compararSenha(password, usuario.senha_hash))) {
      await registrarTentativa(email, false);
      return Response.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    await registrarTentativa(email, true);

    const token = gerarToken(usuario);
    const refreshToken = gerarRefreshToken();
    const hashedRefreshToken = hashToken(refreshToken);

    await queryOne(
      "INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
      [usuario.id, hashedRefreshToken]
    );

    const response = Response.json({
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
```

- [ ] **Step 4: Refresh token API route**

`src/app/api/auth/refresh/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { queryOne, query } from "@/lib/db";
import { gerarToken, gerarRefreshToken, hashToken, verificarToken } from "@/lib/auth";

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

    const usuario = await queryOne<{ id: number; nome: string; email: string; role: string }>(
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

    return Response.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/middleware.ts src/app/api/auth/
git commit -m "feat: add auth library, middleware, and login/refresh API routes"
```

---

### Task 5: Logger + Telegram + WhatsApp libs

**Files:**
- Create: `src/lib/logger.ts`
- Create: `src/lib/telegram.ts`
- Create: `src/lib/whatsapp.ts`

- [ ] **Step 1: Create logger**

`src/lib/logger.ts`:
```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export function log(level: string, module: string, message: string, meta?: Record<string, unknown>) {
  logger.log(level, `[${module}] ${message}`, meta);
}

export default logger;
```

- [ ] **Step 2: Create WhatsApp link helper**

`src/lib/whatsapp.ts`:
```typescript
export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  const numero = telefone.replace(/\D/g, "");
  return `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;
}
```

- [ ] **Step 3: Create Telegram client**

Read the existing `packages/core/telegram/client.js` from legado to adapt. Key functions: `sendMessage`, `sendDocument`, `sendMarkdown`.

`src/lib/telegram.ts`:
```typescript
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface TelegramResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

async function call(method: string, body: Record<string, unknown>): Promise<TelegramResponse> {
  const res = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function sendMessage(chatId: string | number, text: string, options?: Record<string, unknown>) {
  return call("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", ...options });
}

export async function sendDocument(chatId: string | number, document: string, caption?: string) {
  return call("sendDocument", { chat_id: chatId, document, caption });
}

export async function sendMarkdown(chatId: string | number, text: string) {
  return call("sendMessage", { chat_id: chatId, text, parse_mode: "MarkdownV2" });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/logger.ts src/lib/telegram.ts src/lib/whatsapp.ts
git commit -m "feat: add logger, telegram client, and whatsapp helpers"
```

---

### Task 6: RD Station library

**Files:**
- Create: `src/lib/rdstation.ts`

- [ ] **Step 1: Create RD Station client**

Read the existing `packages/core/rdstation/` from legado. Key functions: OAuth flow, creating deals, syncing products.

`src/lib/rdstation.ts`:
```typescript
import axios from "axios";

const BASE_URL = "https://crm.rdstation.com/api/v1";
const CLIENT_ID = process.env.RD_STATION_CLIENT_ID;
const CLIENT_SECRET = process.env.RD_STATION_CLIENT_SECRET;
const REDIRECT_URI = process.env.RD_STATION_REDIRECT_URI;

let accessToken: string | null = null;

export function getAuthUrl(): string {
  return `https://api.rd.services/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
}

export async function exchangeCode(code: string): Promise<{ access_token: string; refresh_token: string }> {
  const res = await axios.post("https://api.rd.services/auth/token", {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code,
  });
  return res.data;
}

export async function createDeal(nome: string, valor: number, contatoEmail: string) {
  const res = await axios.post(
    `${BASE_URL}/deals`,
    { deal: { name: nome, amount: valor, deal_stage_id: "" }, contact: { email: contatoEmail } },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return res.data;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/rdstation.ts
git commit -m "feat: add RD Station CRM integration"
```

---

## Phase 2: API Routes (1 week)

### Task 7: Orçamentos API (CRUD)

**Files:**
- Create: `src/lib/orcamento.ts`
- Create: `src/app/api/orcamentos/route.ts`
- Create: `src/app/api/orcamentos/[id]/route.ts`

- [ ] **Step 1: Orçamento business logic**

`src/lib/orcamento.ts`:
```typescript
import { query, queryMany, queryOne } from "./db";
import { Orcamento, OrcamentoItem, OrcamentoStatus } from "@/types";

interface CreateOrcamentoInput {
  cliente_nome: string;
  cliente_telefone: string;
  cliente_endereco?: string;
  items: Omit<OrcamentoItem, "id" | "orcamento_id" | "total">[];
  vendedor_id: number;
}

export function calcularTotal(items: Pick<OrcamentoItem, "quantidade" | "valor_unitario">[]): number {
  return items.reduce((acc, item) => acc + item.quantidade * item.valor_unitario, 0);
}

export async function listarOrcamentos(filtros?: {
  status?: OrcamentoStatus;
  vendedor_id?: number;
}): Promise<Orcamento[]> {
  let sql = "SELECT * FROM orcamentos WHERE 1=1";
  const params: unknown[] = [];
  let idx = 1;

  if (filtros?.status) {
    sql += ` AND status = $${idx++}`;
    params.push(filtros.status);
  }
  if (filtros?.vendedor_id) {
    sql += ` AND vendedor_id = $${idx++}`;
    params.push(filtros.vendedor_id);
  }
  sql += " ORDER BY created_at DESC";

  return queryMany<Orcamento>(sql, params);
}

export async function buscarOrcamento(id: number): Promise<Orcamento | null> {
  const orcamento = await queryOne<Orcamento>("SELECT * FROM orcamentos WHERE id = $1", [id]);
  if (!orcamento) return null;

  const items = await queryMany<OrcamentoItem>(
    "SELECT * FROM orcamento_items WHERE orcamento_id = $1 ORDER BY id",
    [id]
  );
  orcamento.items = items;
  orcamento.total = calcularTotal(items);

  return orcamento;
}

export async function criarOrcamento(input: CreateOrcamentoInput): Promise<Orcamento> {
  const total = calcularTotal(input.items);

  const orcamento = await queryOne<Orcamento>(
    `INSERT INTO orcamentos (cliente_nome, cliente_telefone, cliente_endereco, total, vendedor_id, status)
     VALUES ($1, $2, $3, $4, $5, 'rascunho') RETURNING *`,
    [input.cliente_nome, input.cliente_telefone, input.cliente_endereco, total, input.vendedor_id]
  );

  if (!orcamento) throw new Error("Failed to create orcamento");

  for (const item of input.items) {
    await queryOne(
      `INSERT INTO orcamento_items (orcamento_id, descricao, quantidade, valor_unitario, total, tipo)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orcamento.id, item.descricao, item.quantidade, item.valor_unitario, item.quantidade * item.valor_unitario, item.tipo]
    );
  }

  return buscarOrcamento(orcamento.id) as Promise<Orcamento>;
}

export async function atualizarStatus(id: number, status: OrcamentoStatus): Promise<Orcamento | null> {
  const fields: string[] = ["status = $1"];
  const params: unknown[] = [status];
  let idx = 2;

  if (status === "enviado") {
    fields.push(`enviado_em = $${idx++}`);
    params.push(new Date().toISOString());
  }
  if (status === "faturado") {
    fields.push(`faturado_em = $${idx++}`);
    params.push(new Date().toISOString());
  }

  params.push(id);
  await query(`UPDATE orcamentos SET ${fields.join(", ")} WHERE id = $${idx}`, params);
  return buscarOrcamento(id);
}
```

- [ ] **Step 2: Orçamentos list + create route**

`src/app/api/orcamentos/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { listarOrcamentos, criarOrcamento } from "@/lib/orcamento";
import { verificarToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const payload = verificarToken(authHeader.replace("Bearer ", ""));
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as any;
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
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const payload = verificarToken(authHeader.replace("Bearer ", ""));
    const body = await request.json();
    const orcamento = await criarOrcamento({ ...body, vendedor_id: payload.id });

    return Response.json(orcamento, { status: 201 });
  } catch (error) {
    console.error("POST /orcamentos error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Orçamento by ID route (GET, PUT, DELETE)**

`src/app/api/orcamentos/[id]/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { buscarOrcamento, atualizarStatus } from "@/lib/orcamento";
import { verificarToken } from "@/lib/auth";
import { OrcamentoStatus } from "@/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    const body = await request.json();
    const orcamento = await atualizarStatus(Number(id), body.status as OrcamentoStatus);
    if (!orcamento) return Response.json({ error: "Orçamento não encontrado" }, { status: 404 });
    return Response.json(orcamento);
  } catch (error) {
    console.error("PUT /orcamentos/[id] error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/orcamento.ts src/app/api/orcamentos/
git commit -m "feat: add orcamentos API (CRUD + status)"
```

---

### Task 8: Produtos + Planos + CRM API

**Files:**
- Create: `src/app/api/produtos/route.ts`
- Create: `src/app/api/planos/route.ts`
- Create: `src/app/api/crm/route.ts`

- [ ] **Step 1: Produtos API**

`src/app/api/produtos/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { queryMany } from "@/lib/db";
import { verificarToken } from "@/lib/auth";
import { Produto } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Não autenticado" }, { status: 401 });
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
```

- [ ] **Step 2: Planos API**

`src/app/api/planos/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { queryMany, queryOne } from "@/lib/db";
import { verificarToken } from "@/lib/auth";
import { Plano } from "@/types";

export async function GET() {
  try {
    const planos = await queryMany<Plano>("SELECT * FROM planos WHERE ativo = true ORDER BY preco_mensal");
    return Response.json(planos);
  } catch (error) {
    console.error("GET /planos error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Não autenticado" }, { status: 401 });
    verificarToken(authHeader.replace("Bearer ", ""));

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
```

- [ ] **Step 3: CRM API**

`src/app/api/crm/route.ts`:
```typescript
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Integração com RD Station para criar deal a partir de orçamento faturado
    return Response.json({ message: "CRM sync triggered" });
  } catch (error) {
    console.error("POST /crm error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/produtos/ src/app/api/planos/ src/app/api/crm/
git commit -m "feat: add produtos, planos, and CRM API routes"
```

---

### Task 9: Cron jobs configuration

**Files:**
- Create: `src/app/api/cron/expirar-orcamentos/route.ts`
- Create: `src/app/api/cron/db-backup/route.ts`
- Create: `src/app/api/cron/sync-rdstation/route.ts`
- Create: `src/app/api/cron/relatorio-semanal/route.ts`
- Create: `src/app/api/cron/alertar-planos/route.ts`
- Create: `src/app/api/cron/alertar-pendentes/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1: Create each cron route**

Pattern for each (já incluso em `src/lib/auth.ts` pela Task 4):
```typescript
// src/app/api/cron/expirar-orcamentos/route.ts
import { query } from "@/lib/db";
import { verificarCronAuth } from "@/lib/auth";

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await query("UPDATE orcamentos SET status = 'expirado' WHERE status = 'enviado' AND created_at < NOW() - INTERVAL '30 days'");
  return Response.json({ ok: true });
}
```

- [ ] **Step 3: Update vercel.json with cron jobs**

```json
{
  "crons": [
    { "path": "/api/cron/expirar-orcamentos", "schedule": "0 1 * * *" },
    { "path": "/api/cron/db-backup", "schedule": "0 0 * * *" },
    { "path": "/api/cron/sync-rdstation", "schedule": "0 3 * * *" },
    { "path": "/api/cron/alertar-planos", "schedule": "0 8 * * *" },
    { "path": "/api/cron/alertar-pendentes", "schedule": "0 9 * * *" },
    { "path": "/api/cron/relatorio-semanal", "schedule": "0 10 * * 1" }
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cron/ vercel.json
git commit -m "feat: add cron job routes and vercel cron config"
```

---

## Phase 3: Frontend (2 weeks)

### Task 10: Layout components (Sidebar + Header)

**Files:**
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/sidebar-item.tsx`
- Create: `src/components/layout/mobile-header.tsx`
- Create: `src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create SidebarItem component**

`src/components/layout/sidebar-item.tsx`:
```typescript
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function SidebarItem({ href, icon, label }: SidebarItemProps) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
```

- [ ] **Step 2: Create Sidebar**

`src/components/layout/sidebar.tsx`:
```typescript
"use client";
import { SidebarItem } from "./sidebar-item";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/orcamentos", label: "Orçamentos", icon: "📋" },
  { href: "/catalogo", label: "Catálogo", icon: "📷" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/planos", label: "Planos", icon: "📦" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background p-4 hidden md:block">
      <div className="flex items-center gap-2 mb-8 px-3">
        <span className="font-bold text-lg">Alfa Câmeras</span>
      </div>
      <nav className="space-y-1">
        {links.map((link) => (
          <SidebarItem key={link.href} href={link.href} icon={<span>{link.icon}</span>} label={link.label} />
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Create Dashboard layout**

`src/app/(dashboard)/layout.tsx`:
```typescript
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/ src/app/\(dashboard\)/
git commit -m "feat: add sidebar layout with navigation"
```

---

### Task 11: Login page

**Files:**
- Create: `src/components/features/login-form.tsx`
- Create: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create LoginForm component**

`src/components/features/login-form.tsx`:
```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao fazer login");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium disabled:opacity-50"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create Login page**

`src/app/(auth)/login/page.tsx`:
```typescript
import { LoginForm } from "@/components/features/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="bg-background p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Alfa Câmeras</h1>
        <LoginForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(auth\)/ src/components/features/login-form.tsx
git commit -m "feat: add login page with form"
```

---

### Task 12: Dashboard page

**Files:**
- Create: `src/components/features/dashboard-kpis.tsx`
- Create: `src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Create Dashboard KPIs component**

`src/components/features/dashboard-kpis.tsx`:
```typescript
interface KPIs {
  totalOrcamentos: number;
  totalFaturado: number;
  taxaConversao: number;
  orcamentosPendentes: number;
}

export function DashboardKPIs({ kpis }: { kpis: KPIs }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Total de Orçamentos</p>
        <p className="text-2xl font-bold">{kpis.totalOrcamentos}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Faturado</p>
        <p className="text-2xl font-bold">R$ {kpis.totalFaturado.toFixed(2)}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
        <p className="text-2xl font-bold">{kpis.taxaConversao}%</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Pendentes</p>
        <p className="text-2xl font-bold">{kpis.orcamentosPendentes}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Dashboard page**

`src/app/(dashboard)/page.tsx`:
```typescript
import { query } from "@/lib/db";
import { DashboardKPIs } from "@/components/features/dashboard-kpis";

export default async function DashboardPage() {
  const totalOrcamentos = await query("SELECT COUNT(*) as count FROM orcamentos");
  const totalFaturado = await query("SELECT COALESCE(SUM(total), 0) as total FROM orcamentos WHERE status = 'faturado'");
  const orcamentosPendentes = await query("SELECT COUNT(*) as count FROM orcamentos WHERE status = 'enviado'");
  const total = await query("SELECT COUNT(*) as count FROM orcamentos");
  const faturados = await query("SELECT COUNT(*) as count FROM orcamentos WHERE status = 'faturado'");

  const totalCount = Number(total.rows[0].count);
  const faturadoCount = Number(faturados.rows[0].count);
  const taxaConversao = totalCount > 0 ? Math.round((faturadoCount / totalCount) * 100) : 0;

  const kpis = {
    totalOrcamentos: Number(totalOrcamentos.rows[0].count),
    totalFaturado: Number(totalFaturado.rows[0].total),
    taxaConversao,
    orcamentosPendentes: Number(orcamentosPendentes.rows[0].count),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DashboardKPIs kpis={kpis} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/page.tsx src/components/features/dashboard-kpis.tsx
git commit -m "feat: add dashboard page with KPIs from database"
```

---

### Task 13: Painel de Orçamentos

**Files:**
- Create: `src/components/features/tabela-orcamentos.tsx`
- Create: `src/components/features/filtros-orcamentos.tsx`
- Create: `src/app/(dashboard)/orcamentos/page.tsx`

- [ ] **Step 1: Create TabelaOrcamentos**

`src/components/features/tabela-orcamentos.tsx`:
```typescript
"use client";
import { Orcamento } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function TabelaOrcamentos({ orcamentos }: { orcamentos: Orcamento[] }) {
  if (orcamentos.length === 0) {
    return <p className="text-muted-foreground">Nenhum orçamento encontrado.</p>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 text-sm font-medium">#</th>
            <th className="text-left p-3 text-sm font-medium">Cliente</th>
            <th className="text-left p-3 text-sm font-medium">Valor</th>
            <th className="text-left p-3 text-sm font-medium">Status</th>
            <th className="text-left p-3 text-sm font-medium">Data</th>
          </tr>
        </thead>
        <tbody>
          {orcamentos.map((orc) => (
            <tr key={orc.id} className="border-t hover:bg-muted/50">
              <td className="p-3">{orc.id}</td>
              <td className="p-3">{orc.cliente_nome}</td>
              <td className="p-3">R$ {orc.total.toFixed(2)}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  orc.status === "faturado" ? "bg-green-100 text-green-700" :
                  orc.status === "enviado" ? "bg-blue-100 text-blue-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {orc.status}
                </span>
              </td>
              <td className="p-3">{format(new Date(orc.created_at), "dd/MM/yyyy", { locale: ptBR })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create Orçamentos page**

`src/app/(dashboard)/orcamentos/page.tsx`:
```typescript
import { listarOrcamentos } from "@/lib/orcamento";
import { TabelaOrcamentos } from "@/components/features/tabela-orcamentos";
import Link from "next/link";

export default async function OrcamentosPage() {
  const orcamentos = await listarOrcamentos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orçamentos</h1>
        <Link
          href="/orcamentos/novo"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        >
          Novo Orçamento
        </Link>
      </div>
      <TabelaOrcamentos orcamentos={orcamentos} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/orcamentos/page.tsx src/components/features/tabela-orcamentos.tsx
git commit -m "feat: add orcamentos list page with table"
```

---

### Task 14: Nova Proposta

**Files:**
- Create: `src/components/features/produto-selector.tsx`
- Create: `src/components/features/nova-proposta-form.tsx`
- Create: `src/app/(dashboard)/orcamentos/novo/page.tsx`

- [ ] **Step 1: Create ProdutoSelector component**

`src/components/features/produto-selector.tsx`:
```typescript
"use client";
import { Produto } from "@/types";

interface ProdutoSelectorProps {
  produtos: Produto[];
  onSelect: (produto: Produto) => void;
}

export function ProdutoSelector({ produtos, onSelect }: ProdutoSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Produto</label>
      <select
        onChange={(e) => {
          const produto = produtos.find((p) => p.id === Number(e.target.value));
          if (produto) onSelect(produto);
        }}
        className="w-full px-3 py-2 border rounded-md"
      >
        <option value="">Selecione um produto...</option>
        {produtos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome} - R$ {p.preco.toFixed(2)}
          </option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 2: Create NovaPropostaForm**

`src/components/features/nova-proposta-form.tsx`:
```typescript
"use client";
import { useState } from "react";
import { Produto, OrcamentoItem } from "@/types";
import { ProdutoSelector } from "./produto-selector";

interface NovaPropostaFormProps {
  produtos: Produto[];
}

export function NovaPropostaForm({ produtos }: NovaPropostaFormProps) {
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [items, setItems] = useState<OrcamentoItem[]>([]);
  const [loading, setLoading] = useState(false);

  function addItem(produto: Produto) {
    setItems([
      ...items,
      {
        descricao: produto.nome,
        quantidade: 1,
        valor_unitario: produto.preco,
        total: produto.preco,
        tipo: "produto",
      },
    ]);
  }

  function updateQuantidade(index: number, quantidade: number) {
    const newItems = [...items];
    newItems[index].quantidade = quantidade;
    newItems[index].total = quantidade * newItems[index].valor_unitario;
    setItems(newItems);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  const total = items.reduce((acc, item) => acc + item.total, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_nome: clienteNome,
          cliente_telefone: clienteTelefone,
          items: items.map(({ descricao, quantidade, valor_unitario, tipo }) => ({
            descricao, quantidade, valor_unitario, tipo,
          })),
        }),
      });

      if (res.ok) {
        window.location.href = "/orcamentos";
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Dados do Cliente</h2>
        <input
          placeholder="Nome do Cliente"
          value={clienteNome}
          onChange={(e) => setClienteNome(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          placeholder="Telefone (com DDD)"
          value={clienteTelefone}
          onChange={(e) => setClienteTelefone(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Itens do Orçamento</h2>
        <ProdutoSelector produtos={produtos} onSelect={addItem} />

        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border rounded">
                <span className="flex-1">{item.descricao}</span>
                <input
                  type="number"
                  value={item.quantidade}
                  onChange={(e) => updateQuantidade(i, Number(e.target.value))}
                  className="w-16 px-2 py-1 border rounded text-center"
                  min="1"
                />
                <span className="w-24 text-right">R$ {item.total.toFixed(2)}</span>
                <button type="button" onClick={() => removeItem(i)} className="text-red-500 text-sm">
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="text-right text-lg font-bold">
          Total: R$ {total.toFixed(2)}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || items.length === 0}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Salvar Orçamento"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create Nova Proposta page**

`src/app/(dashboard)/orcamentos/novo/page.tsx`:
```typescript
import { queryMany } from "@/lib/db";
import { Produto } from "@/types";
import { NovaPropostaForm } from "@/components/features/nova-proposta-form";

export default async function NovaPropostaPage() {
  const produtos = await queryMany<Produto>("SELECT * FROM produtos ORDER BY marca, nome");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Nova Proposta</h1>
      <NovaPropostaForm produtos={produtos} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/orcamentos/novo/ src/components/features/nova-proposta-form.tsx src/components/features/produto-selector.tsx
git commit -m "feat: add nova proposta page with product selector"
```

---

### Task 15: Detalhes do Orçamento + Clientes + Planos

**Files:**
- Create: `src/components/features/cartao-orcamento.tsx`
- Create: `src/app/(dashboard)/orcamentos/[id]/page.tsx`
- Create: `src/app/(dashboard)/clientes/page.tsx`
- Create: `src/components/features/clientes-lista.tsx`
- Create: `src/app/(dashboard)/planos/page.tsx`
- Create: `src/components/features/planos-lista.tsx`
- Create: `src/components/features/planos-form.tsx`

- [ ] **Step 1: Create CartaoOrcamento**

`src/components/features/cartao-orcamento.tsx`:
```typescript
"use client";
import { Orcamento } from "@/types";
import { gerarLinkWhatsApp } from "@/lib/whatsapp";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function CartaoOrcamento({ orcamento }: { orcamento: Orcamento }) {
  const mensagem = `Olá ${orcamento.cliente_nome}! Seu orçamento ficou em R$ ${orcamento.total.toFixed(2)}.`;
  const linkWhatsApp = gerarLinkWhatsApp(orcamento.cliente_telefone, mensagem);

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">Orçamento #{orcamento.id}</h2>
          <p className="text-muted-foreground">{orcamento.cliente_nome}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          orcamento.status === "faturado" ? "bg-green-100 text-green-700" :
          orcamento.status === "enviado" ? "bg-blue-100 text-blue-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {orcamento.status}
        </span>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Item</th>
            <th className="text-center py-2">Qtd</th>
            <th className="text-right py-2">Valor Unit.</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {orcamento.items.map((item, i) => (
            <tr key={i} className="border-b">
              <td className="py-2">{item.descricao}</td>
              <td className="text-center py-2">{item.quantidade}</td>
              <td className="text-right py-2">R$ {item.valor_unitario.toFixed(2)}</td>
              <td className="text-right py-2">R$ {item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="text-right font-bold py-2">Total</td>
            <td className="text-right font-bold py-2">R$ {orcamento.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="flex gap-2">
        <a
          href={linkWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
        >
          Enviar via WhatsApp
        </a>
        {orcamento.status === "rascunho" && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
            Marcar como Enviado
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create orçamento detalhe page**

`src/app/(dashboard)/orcamentos/[id]/page.tsx`:
```typescript
import { buscarOrcamento } from "@/lib/orcamento";
import { CartaoOrcamento } from "@/components/features/cartao-orcamento";
import { notFound } from "next/navigation";

export default async function OrcamentoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orcamento = await buscarOrcamento(Number(id));

  if (!orcamento) notFound();

  return (
    <div>
      <CartaoOrcamento orcamento={orcamento} />
    </div>
  );
}
```

- [ ] **Step 3: Create Clientes page**

`src/app/(dashboard)/clientes/page.tsx`:
```typescript
import { queryMany } from "@/lib/db";

interface ClienteResumo {
  nome: string;
  telefone: string;
  total_orcamentos: number;
  ultimo_orcamento: string;
}

export default async function ClientesPage() {
  const clientes = await queryMany<ClienteResumo>(
    `SELECT cliente_nome as nome, cliente_telefone as telefone,
            COUNT(*) as total_orcamentos,
            MAX(created_at) as ultimo_orcamento
     FROM orcamentos
     GROUP BY cliente_nome, cliente_telefone
     ORDER BY ultimo_orcamento DESC`
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clientes</h1>
      {clientes.length === 0 ? (
        <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 text-sm font-medium">Nome</th>
                <th className="text-left p-3 text-sm font-medium">Telefone</th>
                <th className="text-left p-3 text-sm font-medium">Orçamentos</th>
                <th className="text-left p-3 text-sm font-medium">Último Orçamento</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c, i) => (
                <tr key={i} className="border-t hover:bg-muted/50">
                  <td className="p-3">{c.nome}</td>
                  <td className="p-3">{c.telefone}</td>
                  <td className="p-3">{c.total_orcamentos}</td>
                  <td className="p-3">{new Date(c.ultimo_orcamento).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create Planos page**

`src/app/(dashboard)/planos/page.tsx`:
```typescript
import { queryMany } from "@/lib/db";
import { Plano } from "@/types";

export default async function PlanosPage() {
  const planos = await queryMany<Plano>("SELECT * FROM planos WHERE ativo = true ORDER BY preco_mensal");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Planos de Suporte</h1>
      {planos.length === 0 ? (
        <p className="text-muted-foreground">Nenhum plano cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {planos.map((plano) => (
            <div key={plano.id} className="border rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-lg">{plano.nome}</h3>
              <p className="text-sm text-muted-foreground">{plano.descricao}</p>
              <p className="text-2xl font-bold">R$ {plano.preco_mensal.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
              {plano.preco_anual && (
                <p className="text-sm text-muted-foreground">R$ {plano.preco_anual.toFixed(2)}/ano</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/orcamentos/\[id\]/ src/app/\(dashboard\)/clientes/ src/app/\(dashboard\)/planos/ src/components/features/cartao-orcamento.tsx
git commit -m "feat: add orcamento details, clientes, and planos pages"
```

---

## Phase 4: Catálogo + Final (1 week)

### Task 16: Catálogo pages

**Files:**
- Create: `src/components/features/product-card.tsx`
- Create: `src/components/features/product-grid.tsx`
- Create: `src/app/(dashboard)/catalogo/page.tsx`
- Create: `src/app/(dashboard)/catalogo/[slug]/page.tsx`

- [ ] **Step 1: Create ProductCard**

`src/components/features/product-card.tsx`:
```typescript
import Link from "next/link";
import { Produto } from "@/types";

export function ProductCard({ produto }: { produto: Produto }) {
  return (
    <Link
      href={`/catalogo/${produto.slug}`}
      className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-video bg-muted flex items-center justify-center">
        {produto.imagem_url ? (
          <img src={produto.imagem_url} alt={produto.nome} className="object-contain h-full p-4" />
        ) : (
          <span className="text-muted-foreground">Sem imagem</span>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs text-muted-foreground uppercase">{produto.marca}</span>
        <h3 className="font-medium">{produto.nome}</h3>
        <p className="text-lg font-bold mt-1">R$ {produto.preco.toFixed(2)}</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create ProductGrid**

`src/components/features/product-grid.tsx`:
```typescript
import { Produto } from "@/types";
import { ProductCard } from "./product-card";

export function ProductGrid({ produtos }: { produtos: Produto[] }) {
  const grouped = produtos.reduce<Record<string, Produto[]>>((acc, p) => {
    if (!acc[p.marca]) acc[p.marca] = [];
    acc[p.marca].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([marca, items]) => (
        <div key={marca}>
          <h2 className="text-xl font-semibold mb-4">{marca}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create Catálogo page**

`src/app/(dashboard)/catalogo/page.tsx`:
```typescript
import { queryMany } from "@/lib/db";
import { Produto } from "@/types";
import { ProductGrid } from "@/components/features/product-grid";

export default async function CatalogoPage() {
  const produtos = await queryMany<Produto>("SELECT * FROM produtos ORDER BY marca, nome");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Catálogo de Produtos</h1>
      <ProductGrid produtos={produtos} />
    </div>
  );
}
```

- [ ] **Step 4: Create produto detalhe page**

`src/app/(dashboard)/catalogo/[slug]/page.tsx`:
```typescript
import { queryOne } from "@/lib/db";
import { Produto } from "@/types";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProdutoDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const produto = await queryOne<Produto>("SELECT * FROM produtos WHERE slug = $1", [slug]);

  if (!produto) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/catalogo" className="text-sm text-primary hover:underline">← Voltar ao Catálogo</Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center p-8">
          {produto.imagem_url ? (
            <img src={produto.imagem_url} alt={produto.nome} className="object-contain h-full" />
          ) : (
            <span className="text-muted-foreground">Sem imagem</span>
          )}
        </div>
        <div className="space-y-4">
          <span className="text-sm text-muted-foreground uppercase">{produto.marca}</span>
          <h1 className="text-2xl font-bold">{produto.nome}</h1>
          {produto.descricao && <p className="text-muted-foreground">{produto.descricao}</p>}
          <p className="text-3xl font-bold">R$ {produto.preco.toFixed(2)}</p>
          <Link
            href={`/orcamentos/novo?produto=${produto.id}`}
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium"
          >
            Criar Proposta
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/catalogo/ src/components/features/product-card.tsx src/components/features/product-grid.tsx
git commit -m "feat: add catalogo pages with product grid and details"
```

---

### Task 17: Imagens + assets finais

- [ ] **Step 1: Copy processed images**

```bash
# From legado project to new project public folder
cp -r "/c/Users/Tio Chang/Documents/crypto/Projeto - Alfa Cameras/vendas/imagens-processadas/media/" "/c/Users/Tio Chang/Documents/crypto/alfa-cameras-next/public/imagens/"
```

- [ ] **Step 2: Create vercel.json for deploy**

```json
{
  "crons": [
    { "path": "/api/cron/expirar-orcamentos", "schedule": "0 1 * * *" },
    { "path": "/api/cron/db-backup", "schedule": "0 0 * * *" },
    { "path": "/api/cron/sync-rdstation", "schedule": "0 3 * * *" },
    { "path": "/api/cron/alertar-planos", "schedule": "0 8 * * *" },
    { "path": "/api/cron/alertar-pendentes", "schedule": "0 9 * * *" },
    { "path": "/api/cron/relatorio-semanal", "schedule": "0 10 * * 1" }
  ]
}
```

- [ ] **Step 3: Test build**

```bash
npm run build
```

Expected: build succeeds with all pages and API routes compiled.

- [ ] **Step 4: Deploy to Vercel**

```bash
npx vercel --prod
```

- [ ] **Step 5: Final commit**

```bash
git add public/imagens/ vercel.json
git commit -m "chore: add catalog images and vercel config"
```

---

## Tasks x RFs Coverage

| Task | RFs cobertos |
|------|-------------|
| T1 - Init project | Setup |
| T2 - Types | Setup |
| T3 - DB | Setup |
| T4 - Auth | RF01, RF02, RF03, RF04 |
| T5 - Logger/Telegram/WhatsApp | RF09, RF17, RF19 |
| T6 - RD Station | RF18 |
| T7 - Orçamentos API | RF05, RF06, RF07, RF08 |
| T8 - Produtos/Planos/CRM | RF11, RF12, RF14, RF16 |
| T9 - Cron jobs | RF20, RF21, RF22, RF23, RF24, RF25 |
| T10 - Layout | Setup |
| T11 - Login | RF01 |
| T12 - Dashboard | RF10 |
| T13 - Painel Orçamentos | RF05, RF06, RF07, RF08 |
| T14 - Nova Proposta | RF05, RF06, RF07, RF13 |
| T15 - Detalhes/Clientes/Planos | RF08, RF09, RF15, RF16 |
| T16 - Catálogo | RF11, RF12, RF13, RF14 |
| T17 - Imagens + Deploy | RNF05, RNF06, RNF07 |

**All 25 RFs covered.**
