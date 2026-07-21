import { buscarOrcamento } from "@/lib/orcamento";
import { queryMany } from "@/lib/db";
import { Produto } from "@/types";
import { NovaPropostaForm } from "@/components/features/nova-proposta-form";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditarOrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orcamento = await buscarOrcamento(Number(id));
  if (!orcamento) notFound();

  const produtos = await queryMany<Produto>("SELECT * FROM produtos ORDER BY marca, nome");

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/orcamentos/${orcamento.id}`} className="text-sm text-primary hover:underline">← Voltar</Link>
        <h1 className="text-3xl font-bold">Editar Orçamento #{orcamento.id}</h1>
      </div>
      <NovaPropostaForm
        produtos={produtos}
        orcamentoId={orcamento.id}
        initialData={{
          cliente_nome: orcamento.cliente_nome,
          cliente_telefone: orcamento.cliente_telefone,
          data: orcamento.data,
          items: orcamento.items,
        }}
      />
    </div>
  );
}
