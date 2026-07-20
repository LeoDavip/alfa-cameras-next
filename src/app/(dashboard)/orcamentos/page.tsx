import { listarOrcamentos } from "@/lib/orcamento";
import { TabelaOrcamentos } from "@/components/features/tabela-orcamentos";
import { OrcamentoStatus } from "@/types";
import Link from "next/link";

export default async function OrcamentosPage(props: { searchParams?: Promise<{ status?: string }> }) {
  const searchParams = await props.searchParams;
  const status = searchParams?.status as OrcamentoStatus | undefined;
  const orcamentos = await listarOrcamentos(status ? { status } : undefined);

  const filtros: { label: string; href: string; ativo: boolean }[] = [
    { label: "Todos", href: "/orcamentos", ativo: !status },
    { label: "Rascunho", href: "/orcamentos?status=rascunho", ativo: status === "rascunho" },
    { label: "Enviado", href: "/orcamentos?status=enviado", ativo: status === "enviado" },
    { label: "Faturado", href: "/orcamentos?status=faturado", ativo: status === "faturado" },
  ];

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
      <div className="flex gap-2">
        {filtros.map((f) => (
          <Link
            key={f.label}
            href={f.href}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              f.ativo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <TabelaOrcamentos orcamentos={orcamentos} />
    </div>
  );
}
