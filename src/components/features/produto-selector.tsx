"use client";
import { Produto } from "@/types";

interface ProdutoSelectorProps {
  produtos: Produto[];
  onSelect: (produto: Produto) => void;
}

export function ProdutoSelector({ produtos, onSelect }: ProdutoSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Produto</label>
      <select
        onChange={(e) => {
          const produto = produtos.find((p) => p.id === Number(e.target.value));
          if (produto) onSelect(produto);
        }}
        className="w-full px-3 py-2 border rounded-md"
      >
        <option value="">Selecione um produto...</option>
        {produtos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome} - R$ {p.preco.toFixed(2)}
          </option>
        ))}
      </select>
    </div>
  );
}
