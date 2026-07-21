import { queryMany, queryOne } from "@/lib/db";
import Link from "next/link";
import { DashboardKPIs } from "@/components/features/dashboard-kpis";
import { StatusChart } from "@/components/features/status-chart";
import { OrcamentosRecentes } from "@/components/features/orcamentos-recentes";

export default async function DashboardPage() {
  const [stats, statusCounts, recentes, clientes] = await Promise.all([
    queryOne<{
      total: number;
      valor_aberto: number;
      valor_faturado: number;
      enviados: number;
      aprovados: number;
    }>(
      `SELECT
        COUNT(*)::int as total,
        COALESCE(SUM(CASE WHEN status = 'enviado' THEN total END), 0) as valor_aberto,
        COALESCE(SUM(CASE WHEN status = 'faturado' THEN total END), 0) as valor_faturado,
        COUNT(*) FILTER (WHERE status = 'enviado')::int as enviados,
        COUNT(*) FILTER (WHERE status = 'aprovado')::int as aprovados
       FROM orcamentos WHERE deleted_at IS NULL`
    ),
    queryMany<{ status: string; count: number }>(
      `SELECT status, COUNT(*)::int as count
       FROM orcamentos WHERE deleted_at IS NULL
       GROUP BY status ORDER BY count DESC`
    ),
    queryMany<{
      id: number;
      cliente_nome: string;
      total: number;
      status: string;
      created_at: string;
    }>(
      `SELECT id, cliente_nome, total, status, created_at
       FROM orcamentos WHERE deleted_at IS NULL
       ORDER BY created_at DESC LIMIT 5`
    ),
    queryOne<{ total: number }>(
      `SELECT COUNT(DISTINCT cliente_nome)::int as total
       FROM orcamentos WHERE deleted_at IS NULL`
    ),
  ]);

  const enviados = Number(stats?.enviados || 0);
  const aprovados = Number(stats?.aprovados || 0);
  const taxaConversao = (enviados + aprovados) > 0
    ? Math.round((aprovados / (enviados + aprovados)) * 100)
    : 0;

  const kpis = {
    totalOrcamentos: Number(stats?.total || 0),
    valorEmAberto: Number(stats?.valor_aberto || 0),
    totalFaturado: Number(stats?.valor_faturado || 0),
    taxaConversao,
    totalClientes: Number(clientes?.total || 0),
    orcamentosPendentes: enviados,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/orcamentos/novo"
          className="px-4 py-2 bg-red-600 text-white rounded-md font-bold hover:bg-red-700 text-sm"
        >
          + Nova Proposta
        </Link>
      </div>

      <DashboardKPIs kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusChart data={statusCounts} />
        <OrcamentosRecentes orcamentos={recentes} />
      </div>
    </div>
  );
}
