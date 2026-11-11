import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductArt from "@/components/ProductArt";
import type { Product } from "@/lib/product-types";
import ProductGallery from "@/components/ProductGallery";
import ProductCustomiser from "@/components/ProductCustomiser";

const db = () => supabase;

export const revalidate = 60;

async function load(slug: string) {
  // Two round trips instead of four: the product with its category ids, then related products.
  const { data } = await db().from("products").select("*, product_categories(category_id)").eq("slug", slug).maybeSingle();
  if (!data) return null;
  const p = data as Product & { product_categories: { category_id: string }[] };
  const ids = p.product_categories.map((c) => c.category_id);
  let related: Product[] = [];
  if (ids.length) {
    const { data: rel } = await db().from("products").select("*, product_categories!inner(category_id)")
      .in("product_categories.category_id", ids).neq("id", p.id).limit(4);
    related = (rel ?? []) as Product[];
  }
  return { p: p as Product, related };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const r = await load((await params).slug);
  return r ? { title: `${r.p.name} | Printling`, description: r.p.description.slice(0, 150) } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const r = await load((await params).slug);
  if (!r) notFound();
  const { p, related } = r;
  const hasSizes = !!p.customisation.sizes?.length;
  const specs = [
    ["Material", p.material], ["Dimensions", p.dimensions],
    ["Production time", p.production_days], ...Object.entries(p.specs),
  ].filter((x): x is [string, string] => !!x[1]);

  return (
    <main className="page-in mx-auto max-w-6xl px-5 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={p.images} name={p.name} />
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{p.name}</h1>
          {!hasSizes && (
            <p className="mt-2 text-xl font-bold">
              ₹{p.price}
              {p.compare_at_price && <s className="ml-2 font-normal text-neutral-500">₹{p.compare_at_price}</s>}
            </p>
          )}
          <p className={`mt-2 text-sm font-bold ${p.in_stock ? "text-emerald-600" : "text-red-600"}`}>
            {p.in_stock ? "In stock" : "Out of stock"}{p.production_days && p.in_stock ? ` · printed in ${p.production_days}` : ""}
          </p>
          <p className="mt-4 max-w-prose text-neutral-700">{p.description}</p>
          <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6">
            <Suspense><ProductCustomiser product={p} /></Suspense>
          </div>
          <p className="mt-3 text-xs text-neutral-500">You order on WhatsApp. Nothing is charged on this site.</p>
          {specs.length > 0 && (
            <dl className="mt-8 divide-y rounded-2xl border border-neutral-200 bg-white text-sm">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-2.5"><dt className="text-neutral-500">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-2xl font-extrabold">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((x) => (
              <Link key={x.id} href={`/products/${x.slug}`} className="rounded-3xl border border-neutral-200 bg-white p-3">
                <ProductArt p={x} />
                <p className="mt-2 font-bold">{x.name}</p>
                <p className="text-sm">₹{x.price}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
