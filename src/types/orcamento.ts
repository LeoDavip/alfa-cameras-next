export type OrcamentoStatus = "rascunho" | "enviado" | "aprovado" | "recusado" | "instalado" | "faturado" | "pago" | "vencido";

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
  aprovado_em?: string;
  recusado_em?: string;
  instalado_em?: string;
  faturado_em?: string;
  pago_em?: string;
  vencido_em?: string;
  deleted_at?: string;
  telegram_message_id?: number;
  crm_deal_id?: string;
  subtotal_equip?: number;
  subtotal_servicos?: number;
  data?: string;
  link_whatsapp?: string;
}
