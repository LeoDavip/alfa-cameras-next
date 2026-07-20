export interface Produto {
  id: number;
  nome: string;
  slug: string;
  marca: "Intelbras" | "Tapo" | "TP-Link";
  descricao?: string;
  preco: number;
  imagem_url?: string;
  categoria: string;
  destaque?: boolean;
}
