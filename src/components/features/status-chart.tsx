interface StatusCount {
  status: string;
  count: number;
}

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

const statusColors: Record<string, string> = {
  rascunho: "bg-gray-400",
  enviado: "bg-blue-500",
  aprovado: "bg-green-500",
  recusado: "bg-red-500",
  instalado: "bg-purple-500",
  faturado: "bg-indigo-500",
  pago: "bg-emerald-500",
  vencido: "bg-orange-500",
};

export function StatusChart({ data }: { data: StatusCount[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Orçamentos por Status</h3>
      <div className="space-y-3">
        {data.map(d => (
          <div key={d.status} className="flex items-center gap-3">
            <span className="w-20 text-sm text-right text-muted-foreground">
              {statusLabels[d.status] || d.status}
            </span>
            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${statusColors[d.status] || "bg-gray-400"}`}
                style={{ width: `${(d.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-8 text-sm font-bold text-right">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
