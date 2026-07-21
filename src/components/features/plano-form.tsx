"use client";
import { useState } from "react";
import { Plano, PlanoTipo } from "@/types";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PlanoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plano?: Plano | null;
  onSave: () => void;
}

const TIPOS: { value: PlanoTipo; label: string }[] = [
  { value: "cobertura_4", label: "Cobertura 4" },
  { value: "cobertura_10", label: "Cobertura 10" },
  { value: "cobertura_total", label: "Cobertura Total" },
  { value: "add_on_prioritario", label: "Add-on Prioritário" },
];

export function PlanoForm({ open, onOpenChange, plano, onSave }: PlanoFormProps) {
  const [nome, setNome] = useState(plano?.nome ?? "");
  const [tipo, setTipo] = useState<PlanoTipo>(plano?.tipo ?? "cobertura_4");
  const [descricao, setDescricao] = useState(plano?.descricao ?? "");
  const [precoMensal, setPrecoMensal] = useState(plano?.preco_mensal ?? 0);
  const [precoAnual, setPrecoAnual] = useState(plano?.preco_anual ?? 0);
  const [ativo, setAtivo] = useState(plano?.ativo ?? true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const method = plano ? "PUT" : "POST";
      const url = plano ? `/api/planos/${plano.id}` : "/api/planos";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, tipo, descricao, preco_mensal: precoMensal, preco_anual: precoAnual || null, ativo }),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      onSave();
      onOpenChange(false);
    } catch {
      alert("Erro ao salvar plano");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{plano ? "Editar Plano" : "Novo Plano"}</DialogTitle>
          <DialogDescription>
            {plano ? "Altere os dados do plano de suporte." : "Preencha os dados do novo plano de suporte."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as PlanoTipo)}
              className="w-full px-3 py-2 border rounded-md"
            >
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço Mensal (R$)</label>
              <input
                type="number"
                value={precoMensal}
                onChange={e => setPrecoMensal(Number(e.target.value))}
                min={0}
                step={0.1}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço Anual (R$)</label>
              <input
                type="number"
                value={precoAnual}
                onChange={e => setPrecoAnual(Number(e.target.value))}
                min={0}
                step={0.1}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={ativo} onChange={e => setAtivo(e.target.checked)} />
            <span className="text-sm">Plano ativo</span>
          </label>

          <DialogFooter>
            <DialogClose>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : plano ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
