import { queryMany } from "@/lib/db";
import { Plano } from "@/types";

export default async function PlanosPage() {
  const planos = await queryMany<Plano>("SELECT * FROM planos WHERE ativo = true ORDER BY preco_mensal");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Planos de Suporte</h1>
      {planos.length === 0 ? (
        <p className="text-muted-foreground">Nenhum plano cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {planos.map((plano) => (
            <div key={plano.id} className="border rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-lg">{plano.nome}</h3>
              <p className="text-sm text-muted-foreground">{plano.descricao}</p>
              <p className="text-2xl font-bold">R$ {plano.preco_mensal.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
              {plano.preco_anual && (
                <p className="text-sm text-muted-foreground">R$ {plano.preco_anual.toFixed(2)}/ano</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
