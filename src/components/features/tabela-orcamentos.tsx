"use client";
import { useRouter } from "next/navigation";
import { Orcamento } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TabelaOrcamentosProps {
  orcamentos: Orcamento[];
}

export function TabelaOrcamentos({ orcamentos }: TabelaOrcamentosProps) {
  const router = useRouter();

  if (orcamentos.length === 0) {
    return <p className="text-muted-foreground">Nenhum orçamento encontrado.</p>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 text-sm font-medium">#</th>
            <th className="text-left p-3 text-sm font-medium">Cliente</th>
            <th className="text-left p-3 text-sm font-medium">Valor</th>
            <th className="text-left p-3 text-sm font-medium">Status</th>
            <th className="text-left p-3 text-sm font-medium">Data</th>
          </tr>
        </thead>
        <tbody>
          {orcamentos.map((orc) => (
            <tr
              key={orc.id}
              onClick={() => router.push(`/orcamentos/${orc.id}`)}
              className="border-t hover:bg-muted/50 cursor-pointer"
            >
              <td className="p-3">{orc.id}</td>
              <td className="p-3">{orc.cliente_nome}</td>
              <td className="p-3">R$ {orc.total.toFixed(2)}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  orc.status === "faturado" ? "bg-green-100 text-green-700" :
                  orc.status === "enviado" ? "bg-blue-100 text-blue-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {orc.status}
                </span>
              </td>
              <td className="p-3">{format(new Date(orc.created_at), "dd/MM/yyyy", { locale: ptBR })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
