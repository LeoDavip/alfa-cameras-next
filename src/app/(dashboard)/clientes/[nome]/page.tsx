import { queryMany, queryOne } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

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

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ nome: string }>;
}) {
  const { nome } = await params;
  const nomeDecoded = decodeURIComponent(nome);

  const [orcamentos, resumo] = await Promise.all([
    queryMany<{
      id: number;
      cliente_nome: string;
      cliente_telefone: string;
      total: number;
      status: string;
      created_at: string;
      data?: string;
    }>(
      `SELECT id, cliente_nome, cliente_telefone, total, status, created_at, data
       FROM orcamentos
       WHERE cliente_nome = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [nomeDecoded]
    ),
    queryOne<{
      total_orcamentos: number;
      total_faturado: number;
      total_aberto: number;
    }>(
      `SELECT
        COUNT(*)::int as total_orcamentos,
        COALESCE(SUM(CASE WHEN status = 'faturado' THEN total END), 0) as total_faturado,
        COALESCE(SUM(CASE WHEN status = 'enviado' THEN total END), 0) as total_aberto
       FROM orcamentos
       WHERE cliente_nome = $1 AND deleted_at IS NULL`,
      [nomeDecoded]
    ),
  ]);

  if (!resumo || orcamentos.length === 0) {
    notFound();
  }

  const telefone = orcamentos[0]?.cliente_telefone || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/clientes" className="text-sm text-muted-foreground hover:underline">
            ← Voltar
          </Link>
          <h1 className="text-3xl font-bold mt-1">{nomeDecoded}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {telefone && <span className="text-muted-foreground">{telefone}</span>}
          <Link
            href={`/orcamentos/novo`}
            className="px-4 py-2 bg-red-600 text-white rounded-md font-bold hover:bg-red-700 text-sm"
          >
            + Nova Proposta
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total de Orçamentos</p>
          <p className="text-2xl font-bold">{resumo.total_orcamentos}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Faturado</p>
          <p className="text-2xl font-bold text-green-700">R$ {Number(resumo.total_faturado).toFixed(2)}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Em Aberto</p>
          <p className="text-2xl font-bold text-blue-700">R$ {Number(resumo.total_aberto).toFixed(2)}</p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 text-sm font-medium">#</th>
              <th className="text-left p-3 text-sm font-medium">Data</th>
              <th className="text-right p-3 text-sm font-medium">Valor</th>
              <th className="text-center p-3 text-sm font-medium">Status</th>
              <th className="text-right p-3 text-sm font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orcamentos.map(o => (
              <tr key={o.id} className="border-t hover:bg-muted/50">
                <td className="p-3">{o.id}</td>
                <td className="p-3 text-sm">
                  {o.data || new Date(o.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-3 text-right font-medium">R$ {o.total.toFixed(2)}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status] || "bg-gray-100 text-gray-700"}`}>
                    {statusLabels[o.status] || o.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/orcamentos/${o.id}`}
                    className="text-sm text-secondary hover:underline font-medium"
                  >
                    Detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
