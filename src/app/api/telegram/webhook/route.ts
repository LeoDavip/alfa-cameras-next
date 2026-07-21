import { NextRequest } from "next/server";
import { buscarOrcamento, atualizarStatus } from "@/lib/orcamento";
import { esc, sendMessage, editMessageText, answerCallbackQuery, InlineKeyboardButton } from "@/lib/telegram";
import { gerarLinkWhatsApp } from "@/lib/whatsapp";
import { queryMany, queryOne } from "@/lib/db";
import { Orcamento, OrcamentoStatus } from "@/types";

function buildOrcamentoMessage(orc: Orcamento, status: string): string {
  const statusEmojis: Record<string, string> = {
    rascunho: "📋", enviado: "📤", aprovado: "✅", recusado: "❌",
    instalado: "🏠", faturado: "💰", pago: "💳", vencido: "⏰",
  };
  const emoji = statusEmojis[status] || "";
  return [
    `📋 <b>Orçamento #${orc.id}</b>`,
    "─".repeat(20),
    `👤 <b>Cliente:</b> ${esc(orc.cliente_nome)}`,
    `💰 <b>Valor:</b> R$ ${orc.total.toFixed(2)}`,
    `📞 <b>Tel:</b> ${orc.cliente_telefone || "Não informado"}`,
    `📌 <b>Status:</b> ${status} ${emoji}`,
  ].join("\n");
}

function buildStatusButtons(orcamentoId: number, currentStatus: string): InlineKeyboardButton[][] {
  const verBtn = [{ text: "👁️ Ver itens", callback_data: `ver:${orcamentoId}` }];

  if (currentStatus === "aprovado" || currentStatus === "instalado" || currentStatus === "faturado" || currentStatus === "pago") {
    return [[...verBtn, { text: "📤 WhatsApp", callback_data: `whatsapp:${orcamentoId}` }]];
  }
  if (currentStatus === "recusado" || currentStatus === "vencido") {
    return [[...verBtn, { text: "🔄 Reabrir", callback_data: `reabrir:${orcamentoId}` }]];
  }
  return [
    [...verBtn, { text: "✅ Aprovar", callback_data: `aprovar:${orcamentoId}` }],
    [{ text: "❌ Recusar", callback_data: `recusar:${orcamentoId}` }, { text: "📤 WhatsApp", callback_data: `whatsapp:${orcamentoId}` }],
  ];
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    if (update.callback_query) {
      const { id: callbackId, data, message } = update.callback_query;
      const chatId = message.chat.id;
      const messageId = message.message_id;
      const [action, idStr] = (data as string).split(":");
      const orcamentoId = Number(idStr);

      switch (action) {
        case "aprovar":
        case "recusar":
        case "reabrir": {
          const novoStatus = action === "reabrir" ? "enviado" : action === "aprovar" ? "aprovado" : "recusado";
          await atualizarStatus(orcamentoId, novoStatus as OrcamentoStatus);

          const orc = await buscarOrcamento(orcamentoId);
          if (!orc) break;

          const msgText = buildOrcamentoMessage(orc, novoStatus);
          const buttons = buildStatusButtons(orcamentoId, novoStatus);
          await editMessageText(chatId, messageId, msgText, buttons);

          const feedback = novoStatus === "aprovado" ? "✅ Orçamento aprovado!" : novoStatus === "recusado" ? "❌ Orçamento recusado." : "🔄 Orçamento reaberto!";
          await answerCallbackQuery(callbackId, feedback);
          break;
        }
        case "ver": {
          const orc = await buscarOrcamento(orcamentoId);
          if (!orc) break;

          let detalhes = `📋 <b>Itens do Orçamento #${orc.id}</b>\n${'─'.repeat(25)}\n`;
          detalhes += `👤 ${esc(orc.cliente_nome)}\n💰 R$ ${orc.total.toFixed(2)}\n📌 ${orc.status}\n\n`;
          detalhes += orc.items.map(i => `• ${esc(i.descricao)} — ${i.quantidade}x R$ ${i.valor_unitario.toFixed(2)}`).join("\n");

          await sendMessage(chatId, detalhes, { message_thread_id: message.message_thread_id });
          await answerCallbackQuery(callbackId, "Detalhes enviados!");
          break;
        }
        case "whatsapp": {
          const orc = await buscarOrcamento(orcamentoId);
          if (!orc) break;

          const mensagem = `Olá ${orc.cliente_nome}! Seu orçamento #${orc.id} ficou em R$ ${orc.total.toFixed(2)}.`;
          const link = gerarLinkWhatsApp(orc.cliente_telefone, mensagem);
          await sendMessage(chatId, `📲 <a href="${link}">Clique aqui</a> para enviar o orçamento #${orc.id} via WhatsApp`, { message_thread_id: message.message_thread_id });
          await answerCallbackQuery(callbackId, "Link do WhatsApp gerado!");
          break;
        }
      }

      return Response.json({ ok: true });
    }

    if (update.message?.text) {
      const text = update.message.text.trim();
      const chatId = update.message.chat.id;
      const topicId = update.message.message_thread_id;

      if (!text.startsWith("/")) return Response.json({ ok: true });

      const [cmd, ...args] = text.split(" ");
      const queryParams = { message_thread_id: topicId };

      switch (cmd) {
        case "/resumo": {
          const total = await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM orcamentos WHERE deleted_at IS NULL");
          const faturado = await queryOne<{ total: number }>("SELECT COALESCE(SUM(total),0) as total FROM orcamentos WHERE status = 'faturado' AND deleted_at IS NULL");
          const pendentes = await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM orcamentos WHERE status = 'enviado' AND deleted_at IS NULL");
          const aprovados = await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM orcamentos WHERE status = 'aprovado' AND deleted_at IS NULL");
          const totalCount = Number(total?.count || 0);
          const conv = totalCount > 0 ? Math.round((Number(aprovados?.count || 0) / totalCount) * 100) : 0;

          const msg = [
            "📊 <b>Resumo</b>",
            "─".repeat(20),
            `📋 Total: ${totalCount}`,
            `💰 Faturado: R$ ${Number(faturado?.total || 0).toFixed(2)}`,
            `⏳ Pendentes: ${Number(pendentes?.count || 0)}`,
            `📈 Conversão: ${conv}%`,
          ].join("\n");

          await sendMessage(chatId, msg, queryParams);
          break;
        }
        case "/pendentes": {
          interface PendenteRow { id: number; cliente_nome: string; total: number; created_at: string; }
          const orcs = await queryMany<PendenteRow>(
            "SELECT id, cliente_nome, total, created_at FROM orcamentos WHERE status = 'enviado' AND deleted_at IS NULL AND created_at < NOW() - INTERVAL '7 days' ORDER BY created_at DESC"
          );

          if (orcs.length === 0) {
            await sendMessage(chatId, "✅ Nenhum orçamento pendente há mais de 7 dias.", queryParams);
            break;
          }

          let msg = `⏳ <b>Orçamentos Pendentes (+7 dias)</b>\n${"─".repeat(25)}\n`;
          msg += orcs.map(o => `#${o.id} ${esc(o.cliente_nome)} — R$ ${Number(o.total).toFixed(2)}`).join("\n");
          await sendMessage(chatId, msg, queryParams);
          break;
        }
        case "/top": {
          interface TopRow { cliente_nome: string; total_orc: number; total_valor: number; }
          const clientes = await queryMany<TopRow>(
            "SELECT cliente_nome, COUNT(*) as total_orc, COALESCE(SUM(total),0) as total_valor FROM orcamentos WHERE deleted_at IS NULL GROUP BY cliente_nome ORDER BY total_valor DESC LIMIT 5"
          );

          let msg = `🏆 <b>Top Clientes</b>\n${"─".repeat(25)}\n`;
          msg += clientes.map((c, i) => `${i+1}. ${esc(c.cliente_nome)} — ${c.total_orc} orç. — R$ ${Number(c.total_valor).toFixed(2)}`).join("\n");
          await sendMessage(chatId, msg, queryParams);
          break;
        }
        case "/buscar": {
          const nome = args.join(" ");
          if (!nome) {
            await sendMessage(chatId, "❌ Use: /buscar <nome do cliente>", queryParams);
            break;
          }
          interface BuscaRow { id: number; cliente_nome: string; total: number; status: string; }
          const orcs = await queryMany<BuscaRow>(
            "SELECT id, cliente_nome, total, status FROM orcamentos WHERE cliente_nome ILIKE $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 10",
            [`%${nome}%`]
          );

          if (orcs.length === 0) {
            await sendMessage(chatId, `🔍 Nenhum orçamento encontrado para "${esc(nome)}".`, queryParams);
            break;
          }

          let msg = `🔍 <b>Resultados para "${esc(nome)}"</b>\n${"─".repeat(25)}\n`;
          msg += orcs.map(o => `#${o.id} ${esc(o.cliente_nome)} — R$ ${Number(o.total).toFixed(2)} (${o.status})`).join("\n");
          await sendMessage(chatId, msg, queryParams);
          break;
        }
        case "/status": {
          const id = Number(args[0]);
          if (!id) {
            await sendMessage(chatId, "❌ Use: /status <id>", queryParams);
            break;
          }
          const orc = await buscarOrcamento(id);
          if (!orc) {
            await sendMessage(chatId, `❌ Orçamento #${id} não encontrado.`, queryParams);
            break;
          }
          const msg = [
            `📋 <b>Orçamento #${orc.id}</b>`,
            "─".repeat(20),
            `👤 ${esc(orc.cliente_nome)}`,
            `📞 ${orc.cliente_telefone || "—"}`,
            `💰 R$ ${orc.total.toFixed(2)}`,
            `📌 ${orc.status}`,
            `📅 ${orc.created_at?.split("T")[0] || "—"}`,
          ].join("\n");
          await sendMessage(chatId, msg, queryParams);
          break;
        }
        case "/ajuda": {
          const msg = [
            "🤖 <b>Comandos disponíveis:</b>",
            "─".repeat(25),
            "/resumo — KPIs do dashboard",
            "/pendentes — Orçamentos pendentes (+7 dias)",
            "/top — Top 5 clientes",
            "/buscar &lt;nome&gt; — Buscar orçamentos",
            "/status &lt;id&gt; — Detalhes do orçamento",
            "/ajuda — Esta mensagem",
          ].join("\n");
          await sendMessage(chatId, msg, queryParams);
          break;
        }
      }

      return Response.json({ ok: true });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return Response.json({ ok: false });
  }
}
