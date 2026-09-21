import { db } from "@/lib/db/prisma";
import type { Product } from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return products;
}
