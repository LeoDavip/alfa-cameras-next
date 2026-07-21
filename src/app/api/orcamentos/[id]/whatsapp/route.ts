import { NextRequest } from "next/server";
import { buscarOrcamento } from "@/lib/orcamento";
import { construirMensagemWhatsApp, gerarLinkWhatsApp } from "@/lib/whatsapp";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orcamento = await buscarOrcamento(Number(id));
    if (!orcamento) {
      return Response.json({ error: "Orçamento não encontrado" }, { status: 404 });
    }

    const mensagem = construirMensagemWhatsApp(orcamento);
    const link = gerarLinkWhatsApp(orcamento.cliente_telefone, mensagem);

    return Response.json({ link, mensagem });
  } catch (error) {
    console.error("GET /orcamentos/[id]/whatsapp error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
