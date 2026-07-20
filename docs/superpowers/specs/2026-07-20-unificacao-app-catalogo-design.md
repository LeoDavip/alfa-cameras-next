# Design: Unificação App de Orçamento + Catálogo em Next.js

## Resumo

Migração do sistema Alfa Câmeras de três projetos separados (Vue 3 + Express + HTML estático) para um único Next.js com TypeScript. Catálogo de produtos vira seção interna do app. Backend Express vira API Routes do Next.js. Deploy mantido no Vercel.

## Arquitetura

### Estrutura
- `src/app/` — App Router (páginas + API Routes)
- `src/components/` — shadcn/ui + components específicos
- `src/lib/` — Lógica de negócio compartilhada
- `src/types/` — Interfaces TypeScript
- `src/middleware.ts` — Autenticação global

### Stack
Next.js 15 + TypeScript + PostgreSQL (Neon) + shadcn/ui + Vercel

### Separação Server/Client
- **Server Components**: Dashboard, Catálogo, Listagens, Layout
- **Client Components**: Nova Proposta, Login, Planos, Modais, Toasts

## Decisões Técnicas

| Decisão | Opção rejeitada | Motivo |
|---------|-----------------|--------|
| Monolito Next.js | Multi-repo / Turborepo | Projeto pequeno, 1 dev, sem benefício em separar |
| API Routes | Express separado | Nativo no Vercel, sem workaround |
| JWT manual | NextAuth.js | Já implementado, troca de lib não agrega |
| zod | class-validator | Nativo TS, sem dependência pesada |
| shadcn/ui | CSS puro / Tailwind só | Componentes prontos, acessíveis, personalizáveis |

## Fases de Implementação

1. **Setup + Core** (1 sem): Projeto Next.js, lib/, types/, middleware, db pool
2. **API Routes** (1 sem): Auth, orçamentos, produtos, planos, crm
3. **Frontend** (2 sem): Todas as páginas (Dashboard, Orçamentos, Nova Proposta, Clientes, Planos, Login)
4. **Catálogo + Final** (1 sem): Página de catálogo dinâmico, deploy, desligamento do legado

## Riscos e Mitigações

- Lógica de negócio: copiar funções existentes, não reimplementar
- Integrações: packages/core vira lib/ em TypeScript
- Zero downtime: sistema legado mantido até fase 4
