export type PlanoTipo = "cobertura_4" | "cobertura_10" | "cobertura_total" | "add_on_prioritario";

export interface Plano {
  id: number;
  nome: string;
  tipo: PlanoTipo;
  descricao: string;
  preco_mensal: number;
  preco_anual?: number;
  ativo: boolean;
  created_at: string;
}
