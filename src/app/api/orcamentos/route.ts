import { NextRequest } from "next/server";
import { listarOrcamentos, criarOrcamento, buscarOrcamento } from "@/lib/orcamento";
import { verificarTokenDeRequest } from "@/lib/auth";
import { Orcamento, OrcamentoStatus } from "@/types";
import { sendInlineKeyboard, esc, InlineKeyboardButton } from "@/lib/telegram";
import { query } from "@/lib/db";

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

export async function GET(request: NextRequest) {
  try {
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") as OrcamentoStatus | null) ?? undefined;
    const vendedorId = payload.role === "admin" ? undefined : payload.id;

    const orcamentos = await listarOrcamentos({ status, vendedor_id: vendedorId });
    return Response.json(orcamentos);
  } catch (error) {
    console.error("GET /orcamentos error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    const orcamento = await criarOrcamento({ ...body, vendedor_id: payload.id });

    const msg = buildOrcamentoMessage(orcamento, "enviado");
    const buttons = buildStatusButtons(orcamento.id, "enviado");
    const topicId = process.env.TELEGRAM_TOPIC_ORCAMENTOS;
    const telResult = await sendInlineKeyboard(msg, buttons, topicId ? Number(topicId) : undefined);

    if (telResult.ok && telResult.result) {
      const resultData = telResult.result as { message_id: number };
      await query("UPDATE orcamentos SET telegram_message_id = $1 WHERE id = $2", [resultData.message_id, orcamento.id]);
    }

    const orcamentoAtualizado = await buscarOrcamento(orcamento.id);
    return Response.json(orcamentoAtualizado || orcamento, { status: 201 });
  } catch (error) {
    console.error("POST /orcamentos error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
