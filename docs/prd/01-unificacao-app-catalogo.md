# PRD-01: Unificação App de Orçamento + Catálogo

## Visão Geral

Unificar o sistema de orçamentos (atualmente Vue 3 + Express) com o catálogo de produtos (atualmente HTML estático) em uma única aplicação Next.js com TypeScript, mantendo o sistema legado em produção até a migração completa.

## Personas e Casos de Uso

| Persona | Objetivo |
|---------|----------|
| **Vendedor (admin/sócio)** | Criar orçamentos, consultar catálogo, gerenciar clientes e planos |
| **Cliente final** | Visualizar catálogo público de produtos (futuro) |

## Requisitos Funcionais

### Módulo Autenticação
- RF01: Login com email + senha
- RF02: JWT com access token (15min) + refresh token (7 dias)
- RF03: Controle de role (admin, sócio)
- RF04: Rate limit de 5 tentativas/minuto no login

### Módulo Orçamentos
- RF05: CRUD completo de orçamentos
- RF06: Itens de orçamento com produtos e serviços
- RF07: Cálculo automático de totais
- RF08: Status: rascunho → enviado → faturado
- RF09: Link WhatsApp com resumo do orçamento
- RF10: Dashboard com KPIs (total, faturado, conversão)

### Módulo Catálogo
- RF11: Listagem de produtos agrupados por marca (Intelbras, Tapo)
- RF12: Detalhes do produto com imagens processadas (sem background)
- RF13: Botão "Criar proposta" a partir do produto
- RF14: Catálogo dinâmico (dados do banco, não HTML estático)

### Módulo Clientes
- RF15: Histórico de orçamentos por cliente

### Módulo Planos
- RF16: CRUD de planos de suporte (Cobertura 4/10/Total, Add-on Prioritário)

### Integrações
- RF17: Notificações Telegram (novo orçamento, alertas, relatórios)
- RF18: Sincronização com RD Station CRM
- RF19: Geração de link WhatsApp

### Tarefas Agendadas
- RF20: Expirar orçamentos automaticamente
- RF21: Backup diário do banco PostgreSQL
- RF22: Relatório semanal por Telegram
- RF23: Alerta de orçamentos pendentes (+7 dias)
- RF24: Alerta de planos a vencer
- RF25: Sincronização diária com RD Station

## Requisitos Não Funcionais
- RNF01: TypeScript em todo o código
- RNF02: Server Components para páginas de leitura, Client Components para formulários
- RNF03: Rate limiting por rota (login, mutações, cron)
- RNF04: Validação de input com zod
- RNF05: Deploy no Vercel
- RNF06: Banco PostgreSQL (Neon, mantido)
- RNF07: Zero downtime durante migração

## Arquitetura Sugerida
Next.js App Router + PostgreSQL (Neon) + Vercel. Migração completa, sem reaproveitamento de código Vue/Express. Cópia e adaptação da lógica de negócio do repositório legado.

## Roadmap

| Fase | Duração | Entrega |
|------|---------|---------|
| 1 - Setup + Core | 1 semana | Projeto Next.js, lib/, types/, middleware, db |
| 2 - API Routes | 1 semana | Todas as rotas da API funcionando |
| 3 - Frontend | 2 semanas | Todas as páginas React substituindo Vue |
| 4 - Catálogo + Final | 1 semana | Catálogo dinâmico, deploy, remoção legado |

## Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Quebrar lógica de cálculos de orçamento | Alto | Copiar funções do repositório atual e testar com dados reais |
| Perder integrações (Telegram, RD Station) | Alto | Adaptar packages/core para TypeScript, validar cada integração |
| Imagens do catálogo sem processamento | Médio | Pipeline de processamento (sharp + rembg) permanece no repositório legado; imagens prontas são copiadas para `public/imagens/` do novo projeto |
| Tempo de migração maior que o estimado | Baixo | Fases independentes, cada uma pode ser validada separadamente |
