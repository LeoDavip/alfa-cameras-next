interface KPIs {
  totalOrcamentos: number;
  totalFaturado: number;
  taxaConversao: number;
  orcamentosPendentes: number;
}

export function DashboardKPIs({ kpis }: { kpis: KPIs }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Total de Orçamentos</p>
        <p className="text-2xl font-bold">{kpis.totalOrcamentos}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Faturado</p>
        <p className="text-2xl font-bold">R$ {kpis.totalFaturado.toFixed(2)}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
        <p className="text-2xl font-bold">{kpis.taxaConversao}%</p>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Pendentes</p>
        <p className="text-2xl font-bold">{kpis.orcamentosPendentes}</p>
      </div>
    </div>
  );
}
