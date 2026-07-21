# Integração RD Station CRM

**Status:** ⏳ Pendente — site rdstation.com.br offline no momento da implementação
**Prioridade:** Média (não bloqueante para o fluxo principal de orçamentos)
**Referência:** Código legado em `Projeto - Alfa Câmeras/packages/core/src/rdstation/`

---

## Visão Geral

A integração com RD Station CRM permite:

1. **Criar contato** no RD Station automaticamente ao criar um orçamento
2. **Criar deal** (negociação) vinculado ao contato
3. **Atualizar stage do deal** conforme o status do orçamento muda
4. **Sincronizar catálogo de produtos** (cron job diário)

---

## Arquivos Necessários

### `src/lib/rdstation.ts` — Cliente RD Station

Implementar com base no legado (`packages/core/src/rdstation/`). Estrutura:

```typescript
// Constantes
const TOKEN_URL = "https://api.rd.services/oauth2/token";
const API_BASE = "https://api.rd.services/crm/v2";

// Helpers
function getCredentials() {
  return {
    client_id: process.env.RD_CLIENT_ID,
    client_secret: process.env.RD_CLIENT_SECRET,
    redirect_uri: process.env.RD_REDIRECT_URI,
  };
}
```

#### Tabela `config` no banco

O legado usa a tabela `config` (chave/valor) para persistir tokens OAuth:

```sql
CREATE TABLE IF NOT EXISTS config (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL
);
```

Chaves utilizadas:
| Chave | Descrição |
|-------|-----------|
| `rd_access_token` | Token de acesso atual |
| `rd_refresh_token` | Token para refresh |
| `rd_expires_at` | Timestamp de expiração (ms) |

#### Funções a implementar

| Função | Descrição |
|--------|-----------|
| `getAccessToken()` | Retorna token válido, faz refresh automático se expirado |
| `refreshAccessToken()` | Troca refresh_token por novo access_token |
| `exchangeCode(code)` | Troca authorization code por tokens (callback OAuth) |
| `criarContato(nome, telefone?)` | `POST /contacts` |
| `criarDeal(orcamento, contatoId?)` | `POST /deals` |
| `atualizarDeal(dealId, status)` | `PUT /deals/:id` — mapeia status local para stage RD |

#### Mapeamento de Status

| Status Local | Stage RD Station |
|-------------|------------------|
| `rascunho` | `lead` |
| `enviado` | `negotiation` |
| `aprovado` | `won` |
| `recusado` | `lost` |
| `instalado` | `won` |
| `faturado` | `won` |
| `pago` | `won` |
| `vencido` | `lost` |

---

### `src/app/api/crm/route.ts` — Callback OAuth

Substituir o stub atual. A rota `GET /api/crm/callback` deve:

1. Se **sem** `?code=` — redirecionar para URL de autorização:
   ```
   https://api.rd.services/auth/dialog?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}
   ```
2. Se **com** `?code=` — trocar code por tokens e salvar no banco

```typescript
// GET /api/crm/callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    // Redirecionar para autorização
    const { client_id, redirect_uri } = getCredentials();
    const authUrl = `https://api.rd.services/auth/dialog?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
    return Response.redirect(authUrl);
  }

  // Trocar code por tokens
  await exchangeCode(code);
  return Response.json({ message: "Autorização RD Station concluída!" });
}
```

---

### Integração com Orçamentos

No `src/lib/orcamento.ts`:

**`criarOrcamento`** — após inserir no banco:
```typescript
// Chamada não-bloqueante (não deve impedir a criação)
try {
  const contato = await rdstation.criarContato(input.cliente_nome, input.cliente_telefone);
  const deal = await rdstation.criarDeal(orcamento, contato?.data?.id);
  if (deal?.data?.id) {
    await query("UPDATE orcamentos SET crm_deal_id = $1 WHERE id = $2", [deal.data.id, orcamento.id]);
  }
} catch (e) {
  logger.warn("CRM sync falhou", { erro: (e as Error).message });
}
```

**`atualizarStatus`** — se `orcamento.crm_deal_id` existir:
```typescript
if (orcamento.crm_deal_id) {
  rdstation.atualizarDeal(orcamento.crm_deal_id, novoStatus).catch(() => {});
}
```

---

### Sincronização de Catálogo (Cron Job)

O cron `/api/cron/sync-rdstation` deve:
1. Buscar token de acesso
2. Listar produtos do CRM (`GET /crm/v2/products`)
3. Comparar com produtos locais (`SELECT * FROM produtos`)
4. Criar/atualizar produtos que diferem

---

## Variáveis de Ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `RD_CLIENT_ID` | Sim | Client ID do app OAuth no RD Station |
| `RD_CLIENT_SECRET` | Sim | Client Secret do app OAuth |
| `RD_REDIRECT_URI` | Sim | URL de callback (ex: `https://alfa-cameras.vercel.app/api/crm/callback`) |

---

## Fluxo de Configuração Inicial

1. Criar app em https://app.rdstation.com.br/api-key (ou via parceiro)
2. Configurar `RD_CLIENT_ID`, `RD_CLIENT_SECRET` e `RD_REDIRECT_URI` no `.env`
3. Acessar `GET /api/crm/callback` para iniciar o fluxo OAuth
4. Autorizar o app no browser
5. Tokens serão salvos automaticamente na tabela `config`
6. A partir daí, criar/atualizar orçamentos sincronizará automaticamente

---

## Código Legado de Referência

O código completo da integração funcional está em:
```
Projeto - Alfa Câmeras/packages/core/src/rdstation/auth.js
Projeto - Alfa Câmeras/packages/core/src/rdstation/crm.js
Projeto - Alfa Câmeras/packages/core/src/rdstation/catalog.js
Projeto - Alfa Câmeras/app/backend/routes/crm.js
```

A implementação no novo sistema deve traduzir de `axios`/`fetch` para `fetch()` nativo (já padrão no runtime) e de `require`/`module.exports` para `import`/`export`.
