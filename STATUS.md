# Status do Projeto

## ✅ Implementado

### Infraestrutura
- [x] Next.js 16.2.10 (Turbopack) + TypeScript + Tailwind v4
- [x] shadcn/ui (botão, card, input, badge, tabela, sidebar, dialog, select, textarea)
- [x] PostgreSQL pool via `pg` com conexão Neon
- [x] Build compila com 0 erros (24 rotas)
- [x] `npm run typecheck` e `npm run lint` passam limpos
- [x] Vercel cron configurado (`vercel.json`)
- [x] `.env` criado com DATABASE_URL e JWT_SECRET reais
- [x] Schema do banco migrado para o novo formato (33 produtos, 4 planos, 3 usuários)

### Backend (API Routes)
- [x] Auth: login com JWT + refresh token + rate limit (5/min)
- [x] Middleware de proteção de rotas (cookie httpOnly)
- [x] CRUD orçamentos (listar, buscar, criar, atualizar status)
- [x] CRUD produtos (GET com filtro por marca)
- [x] CRUD planos (GET + POST)
- [x] CRM: integração RD Station (stub — falta configurar)
- [x] 6 rotas cron: expirar orçamentos, backup DB, sync RDStation, relatório semanal, alertar planos, alertar pendentes
- [x] Logger via winston
- [x] Notificações: Telegram (enviar msg, documento, markdown)
- [x] WhatsApp: gerar link com mensagem automática
- [x] Auth por cookie padronizado em todas as rotas

### Frontend
- [x] Login com formulário e feedback de erro
- [x] Dashboard com KPIs (total, faturado, taxa de conversão, pendentes)
- [x] Sidebar com navegação responsiva (desktop + mobile)
- [x] Lista de orçamentos com tabela, filtro por status e link para detalhes
- [x] Detalhes do orçamento com botões "Marcar como Enviado/Faturado" e WhatsApp
- [x] Nova proposta com seletor de produtos e cálculo automático
- [x] Página de clientes (histórico por cliente)
- [x] Página de planos (listagem)
- [x] Catálogo de produtos (grid por marca: Intelbras, Tapo, TP-Link)
- [x] Detalhes do produto no catálogo com link "Criar Proposta"

---

## 🔄 Falta Fazer

### Antes do Deploy
- [x] **Telegram configurado** — bot "Projeto - AlfaCâmeras" no grupo "Gerenciador Infra-AlfaCâmeras"
- [ ] **Configurar RD Station** — credenciais OAuth
- [ ] **Verificar caminhos das imagens** — confirmar que os slugs dos produtos batem com os arquivos em `public/imagens/`

### Deploy
- [ ] **`npx vercel --prod`** — fazer o deploy inicial
- [ ] **Configurar variáveis de ambiente no Vercel** (Dashboard > Settings > Environment Variables)
- [ ] **Configurar CRON_SECRET** para autenticação dos cron jobs
- [ ] **Configurar domínio personalizado** (se houver)

### Melhorias Técnicas
- [ ] **Migrar `middleware.ts` → `proxy`** — Next.js 16 depreca o middleware legado (mostra warning mas funciona)
- [ ] **HMAC real nos cron jobs** — `CRON_SECRET` precisa ser configurado
- [ ] **Testes automatizados** — nenhum teste foi escrito ainda
- [ ] **Loading states** — páginas do dashboard não têm skeletons/loading
- [ ] **Validação Zod nas API Routes** — algumas rotas não validam input com Zod
- [ ] **Resetar senha do usuario "socio"** — senha atual não confere com a informada

### Fora do Escopo (não implementado)
- [ ] Página de administração de usuários
- [ ] Editar/excluir proposta (só criar e ver)
- [ ] Relatórios avançados (exportar PDF/Excel)
- [ ] Upload de imagens pelo sistema
- [ ] Notificações push/página de configurações

---

## Estado Atual

| Componente | Status |
|---|---|
| Build (24 rotas) | ✅ 0 erros |
| TypeScript | ✅ 0 erros |
| Lint | ✅ 0 erros |
| .env configurado | ✅ |
| Schema do banco | ✅ migrado |
| Login admin | ✅ testado |
| Produtos (33) | ✅ OK |
| Planos (4) | ✅ OK |
| Fluxo orçamentos | ✅ criar, listar, filtrar, atualizar status, WhatsApp |
| Detalhes orçamento | ✅ clicável na tabela, botões de status funcionais |
| Deploy | ⏳ não feito |
| Telegram / RD Station | ⏳ sem credenciais |
