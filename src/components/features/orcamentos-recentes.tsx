import Link from "next/link";

interface OrcamentoResumo {
  id: number;
  cliente_nome: string;
  total: number;
  status: string;
  created_at: string;
}

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

export function OrcamentosRecentes({ orcamentos }: { orcamentos: OrcamentoResumo[] }) {
  if (orcamentos.length === 0) {
    return (
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Orçamentos Recentes</h3>
        <p className="text-sm text-muted-foreground">Nenhum orçamento encontrado.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Orçamentos Recentes</h3>
      <div className="space-y-2">
        {orcamentos.map(o => (
          <Link
            key={o.id}
            href={`/orcamentos/${o.id}`}
            className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-medium text-muted-foreground">#{o.id}</span>
              <span className="text-sm font-medium truncate">{o.cliente_nome}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-bold">R$ {o.total.toFixed(2)}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status] || "bg-gray-100 text-gray-700"}`}>
                {statusLabels[o.status] || o.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
