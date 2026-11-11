import { supabase } from "@/lib/supabase";
import type { Category, Product } from "@/lib/product-types";
import ShopClient from "@/components/ShopClient";

export const metadata = { title: "Shop | Printling" };
export const revalidate = 60;

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const sp = await searchParams;
  const [{ data: cats }, { data: prods }, { data: links }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*"),
    supabase.from("product_categories").select("product_id, category_id"),
  ]);
  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <ShopClient
        products={(prods ?? []) as Product[]}
        categories={(cats ?? []) as Category[]}
        links={(links ?? []) as { product_id: string; category_id: string }[]}
        initialQ={sp.q ?? ""}
        initialCat={sp.category ?? ""}
      />
    </main>
  );
}
