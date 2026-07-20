import Link from "next/link";
import { Produto } from "@/types";

export function ProductCard({ produto }: { produto: Produto }) {
  return (
    <Link
      href={`/catalogo/${produto.slug}`}
      className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-video bg-muted flex items-center justify-center">
        {produto.imagem_url ? (
          <img src={produto.imagem_url} alt={produto.nome} className="object-contain h-full p-4" />
        ) : (
          <span className="text-muted-foreground">Sem imagem</span>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs text-muted-foreground uppercase">{produto.marca}</span>
        <h3 className="font-medium">{produto.nome}</h3>
        <p className="text-lg font-bold mt-1">R$ {produto.preco.toFixed(2)}</p>
      </div>
    </Link>
  );
}
