# Security Checklist — Alfa Câmeras

## Antes de criar uma API Route

- [ ] Rota exige autenticação? Usar middleware ou verificar JWT individualmente
- [ ] Rota é pública? Justificar (ex: login, webhook público)
- [ ] Input validado com zod? (tipo, formato, tamanho máximo)
- [ ] Rate limit adequado? (login: 5/min, mutações: 30/min, default: 30/min)
- [ ] Headers sensíveis estão sendo logados? (strip Authorization, Cookie, x-api-key)

## Antes de expor dados no response

- [ ] Algum campo expõe PII sem necessidade? (email, telefone, telegramUserId)
- [ ] O middleware de auth filtra campos desnecessários?
- [ ] Erro retornado não contém stack trace ou detalhes internos?

## Antes de consumir dados externos (webhook RD Station, Telegram)

- [ ] Input validado? (tamanho máximo, tipo, formato)
- [ ] URL validada se houver download? (proteção SSRF)
- [ ] HMAC/assinatura verificada quando aplicável?
- [ ] Proteção contra replay? (idempotency key se necessário)

## Antes de finalizar uma feature

- [ ] `.env.example` atualizado com novas variáveis?
- [ ] Build limpo (`npm run build` sem erros)?
- [ ] Testes passando?
- [ ] Cron job seguro? (HMAC validation no header da requisição)
