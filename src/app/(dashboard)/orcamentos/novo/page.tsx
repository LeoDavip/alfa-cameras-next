import { queryMany } from "@/lib/db";
import { Produto } from "@/types";
import { NovaPropostaForm } from "@/components/features/nova-proposta-form";

export default async function NovaPropostaPage() {
  const produtos = await queryMany<Produto>("SELECT * FROM produtos ORDER BY marca, nome");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Nova Proposta</h1>
      <NovaPropostaForm produtos={produtos} />
    </div>
  );
}
