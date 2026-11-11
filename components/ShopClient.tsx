"use client";
import { useMemo, useState } from "react";
import { Product, Category, startPrice } from "@/lib/product-types";
import ProductGrid from "./ProductGrid";

const PAGE = 9;
const RANGES: [string, number, number][] = [["Any price", 0, Infinity], ["Under ₹300", 0, 299], ["₹300 to ₹600", 300, 600], ["Above ₹600", 601, Infinity]];

export default function ShopClient({ products, categories, links, initialQ, initialCat }: {
  products: Product[]; categories: Category[]; links: { product_id: string; category_id: string }[];
  initialQ: string; initialCat: string;
}) {
  const [q, setQ] = useState(initialQ);
  const [cat, setCat] = useState(initialCat);
  const [range, setRange] = useState(0);
  const [colour, setColour] = useState("");
  const [stock, setStock] = useState(false);
  const [sort, setSort] = useState("pop");
  const [shown, setShown] = useState(PAGE);

  const colours = useMemo(() => {
    const m = new Map<string, string>();
    products.forEach((p) => p.customisation.colours?.forEach((c) => m.set(c.name, c.hex)));
    return [...m];
  }, [products]);

  const list = useMemo(() => {
    const current = categories.find((c) => c.slug === cat);
    // A category also includes the products of its subcategories.
    const ids = new Set(current ? [current.id, ...categories.filter((c) => c.parent_id === current.id).map((c) => c.id)] : []);
    const inCat = new Set(links.filter((l) => ids.has(l.category_id)).map((l) => l.product_id));
    const [, lo, hi] = RANGES[range];
    const term = q.trim().toLowerCase();
    return products
      .filter((p) => (!current || inCat.has(p.id)) && (!term || `${p.name} ${p.description}`.toLowerCase().includes(term))
        && startPrice(p) >= lo && startPrice(p) <= hi
        && (!colour || p.customisation.colours?.some((c) => c.name === colour)) && (!stock || p.in_stock))
      .sort((a, b) => sort === "lo" ? startPrice(a) - startPrice(b) : sort === "hi" ? startPrice(b) - startPrice(a)
        : sort === "new" ? b.created_at.localeCompare(a.created_at) : b.sales_count - a.sales_count);
  }, [products, categories, links, q, cat, range, colour, stock, sort]);

  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setShown(PAGE); };
  const chip = (on: boolean) => `rounded-full border px-3 py-1 text-sm ${on ? "border-[#2A2745] bg-[#2A2745] text-white" : "border-violet-200"}`;
  const inp = "w-full rounded-xl border border-violet-200 bg-white px-3 py-2";

  return (
    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <aside className="h-fit space-y-5 rounded-3xl border border-violet-100 bg-white p-5 lg:sticky lg:top-24">
        <div><h3 className="mb-2 font-bold">Search</h3><input value={q} onChange={(e) => reset(setQ)(e.target.value)} placeholder="Search products" className={inp} /></div>
        <div><h3 className="mb-2 font-bold">Category</h3>
          <div className="flex flex-wrap gap-1.5">
            <button className={chip(!cat)} onClick={() => reset(setCat)("")}>All</button>
            {categories.filter((c) => !c.parent_id).map((c) => <button key={c.id} className={chip(cat === c.slug)} onClick={() => reset(setCat)(c.slug)}>{c.name}</button>)}
          </div></div>
        <div><h3 className="mb-2 font-bold">Price</h3>
          <select value={range} onChange={(e) => reset(setRange)(+e.target.value)} className={inp}>{RANGES.map((r, i) => <option key={r[0]} value={i}>{r[0]}</option>)}</select></div>
        <div><h3 className="mb-2 font-bold">Colour</h3>
          <div className="flex flex-wrap gap-2">
            {colours.map(([n, h]) => <button key={n} aria-label={n} aria-pressed={colour === n} onClick={() => reset(setColour)(colour === n ? "" : n)}
              className={`h-7 w-7 rounded-full ring-offset-2 ${colour === n ? "ring-2 ring-[#2A2745]" : "ring-1 ring-neutral-300"}`} style={{ background: h }} />)}
          </div></div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={stock} onChange={(e) => reset(setStock)(e.target.checked)} /> In stock only</label>
      </aside>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold">{categories.find((c) => c.slug === cat)?.name ?? "All products"} ({list.length})</h1>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" className="rounded-xl border border-violet-200 bg-white px-3 py-2">
            <option value="pop">Popularity</option><option value="new">Newest</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option>
          </select>
        </div>
        <ProductGrid products={list.slice(0, shown)} cols="lg:grid-cols-3" />
        {list.length > shown && <div className="mt-6 text-center"><button onClick={() => setShown((n) => n + PAGE)} className="rounded-full border border-violet-200 bg-white px-8 py-3 font-bold">Load more</button></div>}
      </div>
    </div>
  );
}
