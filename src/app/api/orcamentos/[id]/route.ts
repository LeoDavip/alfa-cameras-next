import { NextRequest } from "next/server";
import { buscarOrcamento, atualizarStatus, atualizarOrcamento, excluirOrcamento } from "@/lib/orcamento";
import { verificarTokenDeRequest } from "@/lib/auth";
import { Orcamento, OrcamentoStatus } from "@/types";
import { esc, editMessageText, InlineKeyboardButton, notify } from "@/lib/telegram";

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const orcamento = await buscarOrcamento(Number(id));
    if (!orcamento) return Response.json({ error: "Orçamento não encontrado" }, { status: 404 });
    return Response.json(orcamento);
  } catch (error) {
    console.error("GET /orcamentos/[id] error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    const orcamento = await atualizarOrcamento(Number(id), body);
    if (!orcamento) return Response.json({ error: "Orçamento não encontrado" }, { status: 404 });
    return Response.json(orcamento);
  } catch (error) {
    console.error("PUT /orcamentos/[id] error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    const orcamento = await atualizarStatus(Number(id), body.status as OrcamentoStatus);
    if (!orcamento) return Response.json({ error: "Orçamento não encontrado" }, { status: 404 });

    if (orcamento.telegram_message_id) {
      const chatId = process.env.TELEGRAM_CHAT_ID;
      const msgText = buildOrcamentoMessage(orcamento, orcamento.status);
      const buttons = buildStatusButtons(orcamento.id, orcamento.status);
      editMessageText(chatId!, orcamento.telegram_message_id, msgText, buttons).catch(() => {});
    }

    const horario = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const hoje = new Date().toLocaleDateString("pt-BR");
    const notif = [
      `📌 <b>Orçamento #${id} ${orcamento.status}</b>`,
      "─".repeat(20),
      `👤 ${esc(orcamento.cliente_nome)} · R$ ${orcamento.total.toFixed(2)}`,
      `por: ${payload.nome} · ${hoje} às ${horario}`,
    ].join("\n");

    notify("orcamentos", notif).catch(() => {});

    return Response.json(orcamento);
  } catch (error) {
    console.error("PATCH /orcamentos/[id] error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = verificarTokenDeRequest(request);
    if (!payload) return Response.json({ error: "Não autenticado" }, { status: 401 });

    const excluido = await excluirOrcamento(Number(id));
    if (!excluido) return Response.json({ error: "Orçamento não encontrado" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("DELETE /orcamentos/[id] error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
