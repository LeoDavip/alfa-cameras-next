# Status do Projeto

## ✅ Implementado

### Infraestrutura
- [x] Next.js 16.2.10 (Turbopack) + TypeScript + Tailwind v4
- [x] shadcn/ui (botão, card, input, badge, tabela, sidebar, dialog, select, textarea)
- [x] PostgreSQL pool via `pg` com conexão Neon
- [x] Build compila com 0 erros (23 rotas)
- [x] `npm run typecheck` passa limpo
- [x] Vercel cron configurado (`vercel.json`)

### Backend (API Routes)
- [x] Auth: login com JWT + refresh token + rate limit (5/min)
- [x] Middleware de proteção de rotas (cookie httpOnly)
- [x] CRUD orçamentos (listar, buscar, criar, atualizar status, excluir)
- [x] CRUD produtos (GET + POST)
- [x] CRUD planos (GET + POST + DELETE)
- [x] CRM: integração RD Station (stub — falta configurar)
- [x] 6 rotas cron: expirar orçamentos, backup DB, sync RDStation, relatório semanal, alertar planos, alertar pendentes
- [x] Logger via winston
- [x] Notificações: Telegram (enviar msg, documento, markdown)
- [x] WhatsApp: gerar link com mensagem automática

### Frontend
- [x] Login com formulário e feedback de erro
- [x] Dashboard com KPIs (total, este mês, pendentes, vencidos, taxa)
- [x] Sidebar com navegação responsiva
- [x] Lista de orçamentos com tabela e filtro por status
- [x] Detalhes do orçamento por ID
- [x] Nova proposta com seletor de produtos, parcelamento, desconto, cálculo automático
- [x] Página de clientes (histórico por cliente)
- [x] Página de planos (listar + criar)
- [x] Catálogo de produtos (grid por marca: Intelbras, Tapo, TP-Link)
- [x] Detalhes do produto no catálogo com descrição CEMI/MED e link "Criar Proposta"
- [x] 46 imagens de produtos copiadas do legado (`public/imagens/`)

---

## 🔄 Falta Fazer

### Antes do Deploy
- [ ] **Criar `.env` com credenciais reais** — DATABASE_URL, JWT_SECRET, Telegram, RD Station
- [ ] **Verificar caminhos das imagens no catálogo** — confirmar que `product.imagem` no DB bate com os arquivos em `public/imagens/`
- [ ] **Testar login real** — conferir se a tabela `usuarios` tem registros no Neon
- [ ] **Testar fluxo completo** — login → criar proposta → listar → ver detalhes

### Deploy
- [ ] **`npx vercel --prod`** — fazer o deploy inicial
- [ ] **Configurar variáveis de ambiente no Vercel** (Dashboard > Settings > Environment Variables)
- [ ] **Configurar cron jobs** — Vercel vai executar automaticamente com base no `vercel.json`
- [ ] **Configurar domínio personalizado** (se houver)

### Melhorias Técnicas
- [ ] **Migrar `middleware.ts` → `proxy`** — Next.js 16 depreca o middleware legado (mostra warning mas funciona)
- [ ] **HMAC real nos cron jobs** — `x-cron-auth` está implementado em `lib/auth.ts` mas precisa da chave HMAC configurada
- [ ] **Testes automatizados** — nenhum teste foi escrito ainda
- [ ] **Loading states** — páginas do dashboard não têm skeletons/loading
- [ ] **Validação Zod nas API Routes** — algumas rotas não validam input com Zod

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
| Build | ✅ 0 erros |
| TypeScript | ✅ 0 erros |
| Deploy | ⏳ não feito |
| Testado com dados reais | ❌ não |
| Migração middleware → proxy | ⏳ pendente |
| Imagens | ✅ copiadas |
