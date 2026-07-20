import { query } from "@/lib/db";
import { DashboardKPIs } from "@/components/features/dashboard-kpis";

export default async function DashboardPage() {
  const totalOrcamentos = await query("SELECT COUNT(*) as count FROM orcamentos");
  const totalFaturado = await query("SELECT COALESCE(SUM(total), 0) as total FROM orcamentos WHERE status = 'faturado'");
  const orcamentosPendentes = await query("SELECT COUNT(*) as count FROM orcamentos WHERE status = 'enviado'");
  const total = await query("SELECT COUNT(*) as count FROM orcamentos");
  const faturados = await query("SELECT COUNT(*) as count FROM orcamentos WHERE status = 'faturado'");

  const totalCount = Number(total.rows[0].count);
  const faturadoCount = Number(faturados.rows[0].count);
  const taxaConversao = totalCount > 0 ? Math.round((faturadoCount / totalCount) * 100) : 0;

  const kpis = {
    totalOrcamentos: Number(totalOrcamentos.rows[0].count),
    totalFaturado: Number(totalFaturado.rows[0].total),
    taxaConversao,
    orcamentosPendentes: Number(orcamentosPendentes.rows[0].count),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DashboardKPIs kpis={kpis} />
    </div>
  );
}
