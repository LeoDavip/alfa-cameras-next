import { queryMany } from "@/lib/db";
import { Produto } from "@/types";
import { ProductGrid } from "@/components/features/product-grid";

export default async function CatalogoPage() {
  const produtos = await queryMany<Produto>("SELECT * FROM produtos ORDER BY marca, nome");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Catálogo de Produtos</h1>
      <ProductGrid produtos={produtos} />
    </div>
  );
}
