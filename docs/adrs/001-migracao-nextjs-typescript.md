# ADR-001: Migração para Next.js com TypeScript

## Contexto

O sistema Alfa Câmeras atualmente é composto por três projetos distintos: um frontend Vue 3 + Vite, um backend Express com PostgreSQL, e um catálogo de vendas em HTML estático. Cada projeto tem seu próprio package.json, deploy e ciclo de vida. O frontend em Vue limita o uso de recursos modernos como Server Components, e o Express depende de um workaround (`api/index.js`) para rodar no Vercel.

## Opções Consideradas

### Opção 1: Next.js Monolith (escolhida)

Unificar tudo em um único projeto Next.js com App Router, API Routes, TypeScript e React Server Components.

**Prós:**
- Deploy nativo no Vercel (sem workaround)
- TypeScript ponta a ponta (tipagem compartilhada entre frontend e backend)
- Server Components para páginas de leitura (Dashboard, Catálogo)
- Client Components para formulários (Nova Proposta)
- Imagem otimizada nativamente (Next.js Image)
- Um único `npm run dev` para tudo
- Menos overhead de manutenção que múltiplos projetos

**Contras:**
- Reescrita completa (nada é reaproveitado de Vue/Express)
- Big bang na troca de domínio/deploy

### Opção 2: Manter Vue + Express + Adicionar Catálogo em Next.js

Criar um projeto Next.js separado só para o catálogo, mantendo o app existente.

**Prós:**
- Menos risco para o sistema atual

**Contras:**
- Três frontends diferentes (Vue, React, HTML) — cada um com seu próprio deploy
- Dados duplicados e lógica de negócio espalhada
- Complexidade de manutenção multiplicada

### Opção 3: Monorepo (Turborepo) com múltiplos apps

Criar um monorepo com `apps/web` (Next.js frontend) e `apps/api` (NestJS ou Express).

**Prós:**
- Separação clara entre frontend e backend
- Compartilhamento de tipos via packages

**Contras:**
- Overengineering para a escala do projeto (1 desenvolvedor)
- Complexidade de build tooling
- Benefício marginal comparado ao monolito

## Decisão

Migrar para Next.js Monolith com TypeScript. Todo o código (páginas, API, lógica de negócio, tipos) em um único projeto.

## Consequências

- Todo código Vue/Express/HTML estático será reescrito, não refatorado
- O repositório legado permanece em produção até a migração completa
- A lógica de negócio será copiada e adaptada para TypeScript, não reinventada
- O novo repositório será limpo, sem histórico de commits do legado
- Total estimado de 5 semanas para reescrita completa
