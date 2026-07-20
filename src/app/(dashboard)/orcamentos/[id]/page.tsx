import { buscarOrcamento } from "@/lib/orcamento";
import { CartaoOrcamento } from "@/components/features/cartao-orcamento";
import { notFound } from "next/navigation";

export default async function OrcamentoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orcamento = await buscarOrcamento(Number(id));

  if (!orcamento) notFound();

  return (
    <div>
      <CartaoOrcamento orcamento={orcamento} />
    </div>
  );
}
