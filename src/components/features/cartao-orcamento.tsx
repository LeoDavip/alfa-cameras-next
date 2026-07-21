"use client";
import { Orcamento } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-700",
  enviado: "bg-blue-100 text-blue-700",
  aprovado: "bg-green-100 text-green-700",
  recusado: "bg-red-100 text-red-700",
  instalado: "bg-purple-100 text-purple-700",
  faturado: "bg-indigo-100 text-indigo-700",
  pago: "bg-emerald-100 text-emerald-700",
  vencido: "bg-orange-100 text-orange-700",
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
  instalado: "Instalado",
  faturado: "Faturado",
  pago: "Pago",
  vencido: "Vencido",
};

export function CartaoOrcamento({ orcamento }: { orcamento: Orcamento }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  async function handleWhatsApp() {
    try {
      const res = await fetch(`/api/orcamentos/${orcamento.id}/whatsapp`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      window.open(data.link, "_blank", "noopener");
    } catch {
      alert("Erro ao gerar link do WhatsApp");
    }
  }

  async function atualizarStatus(novoStatus: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/orcamentos/${orcamento.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar status");
      router.refresh();
    } catch {
      alert("Erro ao atualizar status");
    } finally {
      setLoading(false);
    }
  }

  async function handleExcluir() {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/orcamentos/${orcamento.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir");
      router.push("/orcamentos");
    } catch {
      alert("Erro ao excluir orçamento");
      setDeleting(false);
    }
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">Orçamento #{orcamento.id}</h2>
          <p className="text-muted-foreground">{orcamento.cliente_nome}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[orcamento.status] || "bg-gray-100 text-gray-700"}`}>
          {statusLabels[orcamento.status] || orcamento.status}
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
        <button
          onClick={handleWhatsApp}
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
        >
          Enviar via WhatsApp
        </button>
        <Link
          href={`/orcamentos/${orcamento.id}/editar`}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        >
          Editar
        </Link>
        {orcamento.status === "rascunho" && (
          <button onClick={() => atualizarStatus("enviado")} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50">
            {loading ? "..." : "Enviar Orçamento"}
          </button>
        )}
        {orcamento.status === "enviado" && (
          <>
            <button onClick={() => atualizarStatus("aprovado")} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm disabled:opacity-50">
              {loading ? "..." : "Aprovar"}
            </button>
            <button onClick={() => atualizarStatus("recusado")} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm disabled:opacity-50">
              {loading ? "..." : "Recusar"}
            </button>
          </>
        )}
        {orcamento.status === "aprovado" && (
          <button onClick={() => atualizarStatus("instalado")} disabled={loading} className="px-4 py-2 bg-blue-700 text-white rounded-md text-sm disabled:opacity-50">
            {loading ? "..." : "Instalar"}
          </button>
        )}
        {orcamento.status === "instalado" && (
          <button onClick={() => atualizarStatus("faturado")} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-50">
            {loading ? "..." : "Faturar"}
          </button>
        )}
        {orcamento.status === "faturado" && (
          <button onClick={() => atualizarStatus("pago")} disabled={loading} className="px-4 py-2 bg-green-800 text-white rounded-md text-sm disabled:opacity-50">
            {loading ? "..." : "Recebido"}
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
