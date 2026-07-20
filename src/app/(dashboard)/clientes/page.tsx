import { queryMany } from "@/lib/db";

interface ClienteResumo {
  nome: string;
  telefone: string;
  total_orcamentos: number;
  ultimo_orcamento: string;
}

export default async function ClientesPage() {
  const clientes = await queryMany<ClienteResumo>(
    `SELECT cliente_nome as nome, cliente_telefone as telefone,
            COUNT(*) as total_orcamentos,
            MAX(created_at) as ultimo_orcamento
     FROM orcamentos
     GROUP BY cliente_nome, cliente_telefone
     ORDER BY ultimo_orcamento DESC`
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clientes</h1>
      {clientes.length === 0 ? (
        <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 text-sm font-medium">Nome</th>
                <th className="text-left p-3 text-sm font-medium">Telefone</th>
                <th className="text-left p-3 text-sm font-medium">Orçamentos</th>
                <th className="text-left p-3 text-sm font-medium">Último Orçamento</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c, i) => (
                <tr key={i} className="border-t hover:bg-muted/50">
                  <td className="p-3">{c.nome}</td>
                  <td className="p-3">{c.telefone}</td>
                  <td className="p-3">{c.total_orcamentos}</td>
                  <td className="p-3">{new Date(c.ultimo_orcamento).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
