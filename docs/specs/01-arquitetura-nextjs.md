# Spec-01: Arquitetura Next.js

## Objetivo

Definir a arquitetura técnica do novo sistema unificado, substituindo Vue 3 + Express + HTML estático por uma única aplicação Next.js com TypeScript.

## Stack

| Tecnologia | Versão | Função |
|------------|--------|--------|
| Next.js | 15 (App Router) | Framework full-stack |
| TypeScript | 5.x | Tipagem |
| React | 19 | UI |
| PostgreSQL (Neon) | — | Banco de dados |
| `pg` | 8.x | Driver PostgreSQL |
| `zod` | 3.x | Validação de schemas |
| `jsonwebtoken` | 9.x | JWT |
| `bcryptjs` | 3.x | Hash de senhas |
| `winston` | 3.x | Logger |
| `axios` | 1.x | HTTP client |
| `shadcn/ui` | — | Componentes base |
| Vercel | — | Plataforma de deploy |

## Estrutura de Diretórios

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx                    # Dashboard
│   │   ├── layout.tsx                  # Sidebar + Header
│   │   ├── orcamentos/
│   │   │   ├── page.tsx                # Painel de orçamentos
│   │   │   ├── novo/page.tsx           # Nova proposta
│   │   │   └── [id]/page.tsx           # Detalhes
│   │   ├── catalogo/
│   │   │   ├── page.tsx                # Listagem de produtos
│   │   │   └── [slug]/page.tsx         # Detalhes do produto
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
│   ├── ui/                             # shadcn/ui + custom
│   ├── layout/                         # Sidebar, Header
│   └── features/                       # NovaProposta, CartaoOrcamento, etc.
├── lib/
│   ├── db.ts                           # Pool PostgreSQL
│   ├── auth.ts                         # JWT helpers
│   ├── orcamento.ts                    # Regras de negócio
│   ├── telegram.ts                     # Notificações
│   ├── rdstation.ts                    # CRM
│   ├── whatsapp.ts                     # Link WhatsApp
│   └── logger.ts                       # Winston
├── types/
│   ├── orcamento.ts
│   ├── produto.ts
│   ├── usuario.ts
│   └── plano.ts
└── middleware.ts                        # JWT global
```

## Fluxo de Dados

### Server Component puro (Dashboard, Catálogo, Listagens)

```
Página (Server Component)
  ├── importa função de lib/
  ├── busca dados do banco diretamente
  └── renderiza HTML com dados prontos
      └── passa props para Client Components (se houver interação)
```

### Client Component + API (Formulários)

```
Página (Server Component)
  └── renderiza Client Component (formulário)
        └── usuário interage (useState, onChange)
              └── submit: fetch("POST /api/...")
                    └── API Route route.ts
                          ├── valida input (zod)
                          ├── verifica JWT
                          ├── chama lib/
                          └── retorna JSON
```

## Migração de Middlewares Existente

| Express (hoje) | Next.js (depois) |
|----------------|-------------------|
| `middlewares/auth.js` (JWT) | `src/middleware.ts` (global) + verificação por rota |
| `middlewares/rate-limit.js` | Para servidor serverless (Vercel), usar tabela `login_attempts` + `rate_limits` no PostgreSQL (já existentes), replicando lógica de contagem por IP via query |
| `middlewares/error.js` | Error boundary + API Route try/catch |
| `middlewares/cron-auth.js` | HMAC validation nas rotas de cron |

## Banco de Dados

O schema PostgreSQL (7 tabelas) é mantido sem alterações:

- `orcamentos`
- `orcamento_items`
- `usuarios`
- `planos`
- `rate_limits`
- `refresh_tokens`
- `login_attempts`

A conexão via Neon continua igual. O `lib/db.ts` reimplementa o pool com `pg` em TypeScript.

## Imagens do Catálogo

O pipeline de processamento de imagens (sharp + background removal) permanece no repositório legado. As imagens processadas em `/vendas/imagens-processadas/` são copiadas para `public/imagens/` do novo projeto. O Next.js Image Optimization cuida do resize/formatos.

## Deploy

- Vercel (frontend + API Routes)
- PostgreSQL via Neon (mantido)
- Cron jobs no `vercel.json` apontando para as novas API Routes
- Domínio mantido: `alfa-cameras.vercel.app`
