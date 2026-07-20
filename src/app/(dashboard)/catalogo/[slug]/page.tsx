import { queryOne } from "@/lib/db";
import { Produto } from "@/types";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProdutoDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const produto = await queryOne<Produto>("SELECT * FROM produtos WHERE slug = $1", [slug]);

  if (!produto) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/catalogo" className="text-sm text-primary hover:underline">← Voltar ao Catálogo</Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center p-8">
          {produto.imagem_url ? (
            <img src={produto.imagem_url} alt={produto.nome} className="object-contain h-full" />
          ) : (
            <span className="text-muted-foreground">Sem imagem</span>
          )}
        </div>
        <div className="space-y-4">
          <span className="text-sm text-muted-foreground uppercase">{produto.marca}</span>
          <h1 className="text-2xl font-bold">{produto.nome}</h1>
          {produto.descricao && <p className="text-muted-foreground">{produto.descricao}</p>}
          <p className="text-3xl font-bold">R$ {produto.preco.toFixed(2)}</p>
          <Link
            href={`/orcamentos/novo?produto=${produto.id}`}
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium"
          >
            Criar Proposta
          </Link>
        </div>
      </div>
    </div>
  );
}
