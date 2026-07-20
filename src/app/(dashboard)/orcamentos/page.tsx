import { listarOrcamentos } from "@/lib/orcamento";
import { TabelaOrcamentos } from "@/components/features/tabela-orcamentos";
import Link from "next/link";

export default async function OrcamentosPage() {
  const orcamentos = await listarOrcamentos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orçamentos</h1>
        <Link
          href="/orcamentos/novo"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        >
          Novo Orçamento
        </Link>
      </div>
      <TabelaOrcamentos orcamentos={orcamentos} />
    </div>
  );
}
