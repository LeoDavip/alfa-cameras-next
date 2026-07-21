import { Orcamento } from "@/types";

export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  const numero = telefone.replace(/\D/g, "");
  return `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;
}

function formatarData(dataStr?: string): string {
  if (!dataStr) return "";
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

function calcularValidade(dataStr?: string): string {
  if (!dataStr) return "7 dias";
  const data = new Date(dataStr);
  data.setDate(data.getDate() + 7);
  return formatarData(data.toISOString().split("T")[0]);
}

export function construirMensagemWhatsApp(orcamento: Orcamento, vendedor?: string): string {
  const items = orcamento.items || [];

  const cameras = items.filter(i => i.tipo === "produto" && !/dvr|nvr|hd |cartão|microsd/i.test(i.descricao));
  const gravador = items.filter(i => /dvr|nvr/i.test(i.descricao));
  const hd = items.filter(i => /^hd /i.test(i.descricao));
  const servicos = items.filter(i => i.tipo === "servico");

  const blocos: string[] = [];

  blocos.push("*ORÇAMENTO ALFA CÂMERAS*");
  blocos.push(`📋 *Cliente:* ${orcamento.cliente_nome}`);
  if (orcamento.data) blocos.push(`📅 *Data:* ${formatarData(orcamento.data)}`);
  blocos.push(`⏳ *Válido até:* ${calcularValidade(orcamento.data)}`);
  blocos.push("");

  if (cameras.length > 0) {
    blocos.push("*🎥 CÂMERAS*");
    cameras.forEach(i =>
      blocos.push(`   ${i.descricao} — ${i.quantidade}x R$ ${i.valor_unitario.toFixed(2)} = R$ ${i.total.toFixed(2)}`)
    );
    blocos.push("");
  }

  if (gravador.length > 0) {
    blocos.push("*💾 GRAVADOR*");
    gravador.forEach(i => blocos.push(`   ${i.descricao} — R$ ${i.total.toFixed(2)}`));
    blocos.push("");
  }

  if (hd.length > 0) {
    blocos.push("*🖴 HD / ARMAZENAMENTO*");
    hd.forEach(i => blocos.push(`   ${i.descricao} — R$ ${i.total.toFixed(2)}`));
    blocos.push("");
  }

  if (servicos.length > 0) {
    blocos.push("*🔧 SERVIÇOS*");
    servicos.forEach(i => blocos.push(`   ${i.descricao} — R$ ${i.total.toFixed(2)}`));
    blocos.push("");
  }

  blocos.push("*💰 RESUMO*");
  blocos.push(`   Equipamentos: R$ ${(orcamento.subtotal_equip ?? cameras.reduce((s, i) => s + i.total, 0) + (gravador.reduce((s, i) => s + i.total, 0)) + (hd.reduce((s, i) => s + i.total, 0))).toFixed(2)}`);
  blocos.push(`   Serviços: R$ ${(orcamento.subtotal_servicos ?? servicos.reduce((s, i) => s + i.total, 0)).toFixed(2)}`);
  blocos.push(`   *Total: R$ ${orcamento.total.toFixed(2)}*`);
  blocos.push("");
  blocos.push("*📞 FALE CONOSCO*");
  blocos.push(`   Vendedor: ${vendedor || orcamento.vendedor_nome || "Equipe Alfa Câmeras"}`);
  if (orcamento.cliente_telefone) blocos.push(`   WhatsApp: ${orcamento.cliente_telefone}`);
  blocos.push("");
  blocos.push(`_Orçamento gerado em ${new Date().toLocaleDateString("pt-BR")}_`);

  return blocos.filter(Boolean).join("\n");
}
