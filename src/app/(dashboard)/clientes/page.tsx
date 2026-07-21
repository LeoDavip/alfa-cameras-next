import { queryMany } from "@/lib/db";
import Link from "next/link";

interface ClienteResumo {
  nome: string;
  telefone: string;
  total_orcamentos: number;
  total_faturado: number;
  total_aberto: number;
  ultimo_orcamento: string;
}

const avatarColors = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-orange-500", "bg-teal-500", "bg-pink-500", "bg-indigo-500",
];

function iniciais(nome: string): string {
  return nome.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const clientes = await queryMany<ClienteResumo>(
    `SELECT
       cliente_nome as nome,
       cliente_telefone as telefone,
       COUNT(*)::int as total_orcamentos,
       COALESCE(SUM(CASE WHEN status = 'faturado' THEN total END), 0) as total_faturado,
       COALESCE(SUM(CASE WHEN status = 'enviado' THEN total END), 0) as total_aberto,
       MAX(created_at) as ultimo_orcamento
     FROM orcamentos
     WHERE deleted_at IS NULL${q ? " AND cliente_nome ILIKE $1" : ""}
     GROUP BY cliente_nome, cliente_telefone
     ORDER BY ultimo_orcamento DESC`,
    q ? [`%${q}%`] : []
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clientes</h1>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Buscar cliente..."
          className="flex-1 max-w-md px-3 py-2 border rounded-md"
        />
        <button type="submit" className="px-4 py-2 bg-secondary text-white rounded-md font-medium text-sm">
          Buscar
        </button>
        {q && (
          <Link href="/clientes" className="px-4 py-2 border rounded-md text-sm">
            Limpar
          </Link>
        )}
      </form>

      {clientes.length === 0 ? (
        <p className="text-muted-foreground">
          {q ? `Nenhum cliente encontrado para "${q}".` : "Nenhum cliente encontrado."}
        </p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 text-sm font-medium">Cliente</th>
                <th className="text-left p-3 text-sm font-medium">Telefone</th>
                <th className="text-center p-3 text-sm font-medium">Orçamentos</th>
                <th className="text-right p-3 text-sm font-medium">Faturado</th>
                <th className="text-right p-3 text-sm font-medium">Em Aberto</th>
                <th className="text-left p-3 text-sm font-medium">Último</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c, i) => (
                <tr key={i} className="border-t hover:bg-muted/50">
                  <td className="p-3">
                    <Link
                      href={`/clientes/${encodeURIComponent(c.nome)}`}
                      className="flex items-center gap-3"
                    >
                      <span className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                        {iniciais(c.nome)}
                      </span>
                      <span className="font-medium hover:underline">{c.nome}</span>
                    </Link>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{c.telefone}</td>
                  <td className="p-3 text-center">{c.total_orcamentos}</td>
                  <td className="p-3 text-right font-medium text-green-700">R$ {Number(c.total_faturado).toFixed(2)}</td>
                  <td className="p-3 text-right font-medium text-blue-700">R$ {Number(c.total_aberto).toFixed(2)}</td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(c.ultimo_orcamento).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
