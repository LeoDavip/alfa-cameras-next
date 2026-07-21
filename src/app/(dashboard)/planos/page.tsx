"use client";
import { useEffect, useState } from "react";
import { Plano } from "@/types";
import { PlanoForm } from "@/components/features/plano-form";

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Plano | null>(null);

  useEffect(() => {
    fetch("/api/planos")
      .then(res => res.ok ? res.json() : [])
      .then(setPlanos)
      .catch(() => setPlanos([]));
  }, []);

  async function handleExcluir(id: number) {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return;
    const res = await fetch(`/api/planos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPlanos(prev => prev ? prev.filter(p => p.id !== id) : []);
    } else {
      alert("Erro ao excluir plano");
    }
  }

  async function handleSave() {
    const res = await fetch("/api/planos");
    if (res.ok) setPlanos(await res.json());
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Planos de Suporte</h1>
        <button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="px-4 py-2 bg-red-600 text-white rounded-md font-bold hover:bg-red-700 text-sm"
        >
          + Novo Plano
        </button>
      </div>

      <PlanoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        plano={editing}
        onSave={handleSave}
      />

      {planos === null ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : planos.length === 0 ? (
        <p className="text-muted-foreground">Nenhum plano cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {planos.map(plano => (
            <div key={plano.id} className="border rounded-lg p-6 space-y-3 relative">
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => { setEditing(plano); setFormOpen(true); }}
                  className="text-xs text-secondary hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleExcluir(plano.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Excluir
                </button>
              </div>
              <h3 className="font-semibold text-lg pr-16">{plano.nome}</h3>
              <p className="text-sm text-muted-foreground min-h-[40px]">{plano.descricao}</p>
              <p className="text-2xl font-bold">
                R$ {plano.preco_mensal.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">/mês</span>
              </p>
              {plano.preco_anual ? (
                <p className="text-sm text-muted-foreground">R$ {plano.preco_anual.toFixed(2)}/ano</p>
              ) : null}
              {!plano.ativo && (
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  Inativo
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
