import { db } from "@/lib/db/prisma";
import type { Product } from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      description: true,
      active: true,
      category: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category.name,
    description: product.description,
    active: product.active,
  }));
}
