"use client";
import { Orcamento } from "@/types";
import { gerarLinkWhatsApp } from "@/lib/whatsapp";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function CartaoOrcamento({ orcamento }: { orcamento: Orcamento }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const mensagem = `Olá ${orcamento.cliente_nome}! Seu orçamento ficou em R$ ${orcamento.total.toFixed(2)}.`;
  const linkWhatsApp = gerarLinkWhatsApp(orcamento.cliente_telefone, mensagem);

  async function atualizarStatus(novoStatus: "enviado" | "faturado") {
    setLoading(true);
    await fetch(`/api/orcamentos/${orcamento.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });
    router.refresh();
  }

  async function handleExcluir() {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;
    setDeleting(true);
    await fetch(`/api/orcamentos/${orcamento.id}`, { method: "DELETE" });
    router.push("/orcamentos");
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">Orçamento #{orcamento.id}</h2>
          <p className="text-muted-foreground">{orcamento.cliente_nome}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          orcamento.status === "faturado" ? "bg-green-100 text-green-700" :
          orcamento.status === "enviado" ? "bg-blue-100 text-blue-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {orcamento.status}
        </span>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Item</th>
            <th className="text-center py-2">Qtd</th>
            <th className="text-right py-2">Valor Unit.</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {orcamento.items.map((item, i) => (
            <tr key={i} className="border-b">
              <td className="py-2">{item.descricao}</td>
              <td className="text-center py-2">{item.quantidade}</td>
              <td className="text-right py-2">R$ {item.valor_unitario.toFixed(2)}</td>
              <td className="text-right py-2">R$ {item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="text-right font-bold py-2">Total</td>
            <td className="text-right font-bold py-2">R$ {orcamento.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="flex flex-wrap gap-2">
        <a
          href={linkWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
        >
          Enviar via WhatsApp
        </a>
        <Link
          href={`/orcamentos/${orcamento.id}/editar`}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        >
          Editar
        </Link>
        {orcamento.status === "rascunho" && (
          <button
            onClick={() => atualizarStatus("enviado")}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
          >
            {loading ? "Atualizando..." : "Marcar como Enviado"}
          </button>
        )}
        {orcamento.status === "enviado" && (
          <button
            onClick={() => atualizarStatus("faturado")}
            disabled={loading}
            className="px-4 py-2 bg-green-700 text-white rounded-md text-sm disabled:opacity-50"
          >
            {loading ? "Atualizando..." : "Marcar como Faturado"}
          </button>
        )}
        <button
          onClick={handleExcluir}
          disabled={deleting}
          className="px-4 py-2 bg-red-600 text-white rounded-md text-sm disabled:opacity-50"
        >
          {deleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </div>
  );
}
