"use client";
import { useState, useRef, useEffect } from "react";
import { Produto } from "@/types";

interface ProdutoBuscaProps {
  produtos: Produto[];
  onSelect: (produto: Produto) => void;
}

export function ProdutoBusca({ produtos, onSelect }: ProdutoBuscaProps) {
  const [busca, setBusca] = useState("");
  const [selected, setSelected] = useState<Produto | null>(null);
  const [qtd, setQtd] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const resultados = busca.trim().length > 0
    ? produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 20)
    : [];

  function handleSelect(p: Produto) {
    setSelected(p);
    setBusca(p.nome);
  }

  function handleAdd() {
    if (!selected) return;
    onSelect(selected);
    setBusca("");
    setSelected(null);
    setQtd(1);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={busca}
            onChange={e => { setBusca(e.target.value); setSelected(null); }}
            placeholder="Buscar câmera..."
            className="w-full px-3 py-2 border rounded-md pl-9"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="number"
          value={qtd}
          onChange={e => setQtd(Math.max(1, Number(e.target.value)))}
          min={1}
          className="w-16 px-2 py-2 border rounded-md text-center"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected}
          className="px-4 py-2 bg-secondary text-white rounded-md font-bold disabled:opacity-50"
        >
          +
        </button>
      </div>
      {busca && resultados.length > 0 && !selected && (
        <div className="absolute z-50 w-full mt-1 border rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
          {resultados.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p)}
              className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0"
            >
              <span className="text-sm">{p.nome}</span>
              <span className="text-sm font-bold text-secondary">R$ {Number(p.preco).toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
