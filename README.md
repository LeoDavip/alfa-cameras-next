# Alfa Câmeras Next

Sistema de orçamentos e catálogo para empresa de segurança eletrônica.

**Stack:** Next.js 16 + TypeScript + PostgreSQL (Neon) + shadcn/ui + Vercel

---

## Começando

```bash
npm install
cp .env.example .env  # preencher com credenciais reais
npm run dev
```

Acessar: `http://localhost:3000`

### .env necessário

| Variável | Onde conseguir |
|---|---|
| `DATABASE_URL` | Neon (PostgreSQL) — mesmo banco do sistema atual |
| `JWT_SECRET` | Gerar com: `openssl rand -hex 32` |
| `TELEGRAM_BOT_TOKEN` | @BotFather no Telegram |
| `TELEGRAM_CHAT_ID` | Chat/grupo onde o bot está |
| `RD_STATION_*` | App RD Station |

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servir build local |
| `npm run typecheck` | Verificar tipos TypeScript |
| `npm run lint` | Verificar lint |

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/login/        # Página de login
│   ├── (dashboard)/         # Área logada (protegida)
│   │   ├── page.tsx         # Dashboard (KPIs)
│   │   ├── orcamentos/      # CRUD de orçamentos
│   │   ├── catalogo/        # Catálogo de produtos
│   │   ├── clientes/        # Histórico de clientes
│   │   └── planos/          # Planos de suporte
│   └── api/                 # API Routes (substitui Express)
│       ├── auth/            # Login + refresh token
│       ├── orcamentos/      # CRUD
│       ├── produtos/        # Listagem
│       ├── planos/          # CRUD
│       ├── crm/             # RD Station
│       └── cron/            # Tarefas agendadas
├── components/
│   ├── ui/                  # shadcn/ui
│   ├── layout/              # Sidebar, Header
│   └── features/            # LoginForm, NovaProposta, etc.
├── lib/                     # Lógica de negócio
│   ├── db.ts                # Conexão PostgreSQL
│   ├── auth.ts              # JWT + rate limit
│   ├── orcamento.ts         # Regras de orçamento
│   ├── telegram.ts          # Notificações
│   ├── rdstation.ts         # CRM
│   └── whatsapp.ts          # Link WhatsApp
├── types/                   # Interfaces TypeScript
└── middleware.ts            # Proteção de rotas
```

---

## Fluxo de Autenticação

1. Usuário faz login em `/login` → `POST /api/auth/login`
2. Retorna JWT (15min) + refresh token (7 dias)
3. JWT salvo em cookie httpOnly
4. Middleware verifica cookie em todas as rotas protegidas
5. Refresh token rotacionado via `POST /api/auth/refresh`
6. Rate limit: 5 tentativas/minuto por email (`login_attempts`)

---

## Banco de Dados

Mesmo schema PostgreSQL do sistema atual (Neon). 7 tabelas mantidas:

- `orcamentos` — orçamentos
- `orcamento_items` — itens de cada orçamento
- `usuarios` — login + role (admin, socio)
- `planos` — planos de suporte
- `refresh_tokens` — refresh tokens JWT
- `login_attempts` — controle de rate limit
- `rate_limits` — rate limiting geral

---

## Deploy

```bash
npx vercel --prod
```

Cron jobs estão configurados no `vercel.json`. O middleware (`middleware.ts`) precisa ser migrado para `proxy` quando o Next.js 16 remover o suporte legado (atualmente mostra warning mas funciona).

---

## Documentação de Arquitetura

Ver `docs/`:
- `docs/prd/` — Product Requirements
- `docs/specs/` — Especificações técnicas
- `docs/adrs/` — Decisões técnicas
- `docs/flows/` — Diagramas Mermaid
- `docs/security-checklist.md` — Checklist de segurança
