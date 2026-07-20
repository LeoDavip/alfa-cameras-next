import { Produto } from "@/types";
import { ProductCard } from "./product-card";

export function ProductGrid({ produtos }: { produtos: Produto[] }) {
  const grouped = produtos.reduce<Record<string, Produto[]>>((acc, p) => {
    if (!acc[p.marca]) acc[p.marca] = [];
    acc[p.marca].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([marca, items]) => (
        <div key={marca}>
          <h2 className="text-xl font-semibold mb-4">{marca}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
