"use client";
import { useState } from "react";
import { Produto, OrcamentoItem } from "@/types";
import { ProdutoSelector } from "./produto-selector";

interface NovaPropostaFormProps {
  produtos: Produto[];
}

export function NovaPropostaForm({ produtos }: NovaPropostaFormProps) {
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [items, setItems] = useState<OrcamentoItem[]>([]);
  const [loading, setLoading] = useState(false);

  function addItem(produto: Produto) {
    setItems([
      ...items,
      {
        descricao: produto.nome,
        quantidade: 1,
        valor_unitario: produto.preco,
        total: produto.preco,
        tipo: "produto",
      },
    ]);
  }

  function updateQuantidade(index: number, quantidade: number) {
    const newItems = [...items];
    newItems[index].quantidade = quantidade;
    newItems[index].total = quantidade * newItems[index].valor_unitario;
    setItems(newItems);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  const total = items.reduce((acc, item) => acc + item.total, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_nome: clienteNome,
          cliente_telefone: clienteTelefone,
          items: items.map(({ descricao, quantidade, valor_unitario, tipo }) => ({
            descricao, quantidade, valor_unitario, tipo,
          })),
        }),
      });

      if (res.ok) {
        window.location.href = "/orcamentos";
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Dados do Cliente</h2>
        <input
          placeholder="Nome do Cliente"
          value={clienteNome}
          onChange={(e) => setClienteNome(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          placeholder="Telefone (com DDD)"
          value={clienteTelefone}
          onChange={(e) => setClienteTelefone(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Itens do Orçamento</h2>
        <ProdutoSelector produtos={produtos} onSelect={addItem} />

        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border rounded">
                <span className="flex-1">{item.descricao}</span>
                <input
                  type="number"
                  value={item.quantidade}
                  onChange={(e) => updateQuantidade(i, Number(e.target.value))}
                  className="w-16 px-2 py-1 border rounded text-center"
                  min="1"
                />
                <span className="w-24 text-right">R$ {item.total.toFixed(2)}</span>
                <button type="button" onClick={() => removeItem(i)} className="text-red-500 text-sm">
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="text-right text-lg font-bold">
          Total: R$ {total.toFixed(2)}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || items.length === 0}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Salvar Orçamento"}
      </button>
    </form>
  );
}
