export type OrcamentoStatus = "rascunho" | "enviado" | "faturado";

export interface OrcamentoItem {
  id?: number;
  orcamento_id?: number;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  total: number;
  tipo: "produto" | "servico";
}

export interface Orcamento {
  id: number;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_endereco?: string;
  items: OrcamentoItem[];
  total: number;
  status: OrcamentoStatus;
  vendedor_id: number;
  vendedor_nome?: string;
  created_at: string;
  updated_at?: string;
  enviado_em?: string;
  faturado_em?: string;
  link_whatsapp?: string;
}
