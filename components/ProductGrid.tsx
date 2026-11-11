"use client";
import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { Product, startPrice } from "@/lib/product-types";
import ProductArt from "./ProductArt";

function Price({ p }: { p: Product }) {
  const sized = !!p.customisation.sizes?.length;
  return (
    <span className="font-bold">
      {sized && <span className="font-normal text-neutral-500">From </span>}₹{startPrice(p)}
      {!sized && p.compare_at_price && <s className="ml-2 font-normal text-neutral-500">₹{p.compare_at_price}</s>}
    </span>
  );
}

const customisable = (p: Product) => !!(p.customisation.text || p.customisation.referenceImage);

export default function ProductGrid({ products, cols = "lg:grid-cols-4" }: { products: Product[]; cols?: string }) {
  const [qv, setQv] = useState<Product | null>(null);
  if (!products.length)
    return <p className="rounded-2xl bg-white p-10 text-center text-neutral-500">No products found. Try clearing a filter.</p>;
  return (
    <>
      <div className={`grid grid-cols-2 gap-4 ${cols}`}>
        {products.map((p) => (
          <div key={p.id} className="flex flex-col rounded-3xl border border-violet-100 bg-white p-3">
            <div className="relative">
              <ProductArt p={p} />
              {p.featured && <span className="absolute left-2 top-2 rounded-full bg-[#2A2745] px-2.5 py-0.5 text-xs font-bold text-white">Featured</span>}
              {customisable(p) && <span className="absolute right-2 top-2 rounded-full bg-emerald-400 px-2.5 py-0.5 text-xs font-bold text-emerald-950">Custom</span>}
              {!p.in_stock && <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/90 py-0.5 text-center text-xs font-bold text-red-600">Out of stock</span>}
            </div>
            <h3 className="mt-3 px-1 text-base font-bold leading-tight">{p.name}</h3>
            <p className="px-1 text-sm"><Price p={p} /></p>
            <div className="mt-2 flex gap-1.5 px-1">
              {p.customisation.colours?.map((c) => <i key={c.name} title={c.name} className="h-3.5 w-3.5 rounded-full ring-1 ring-neutral-300" style={{ background: c.hex }} />)}
            </div>
            <div className="mt-auto flex gap-2 pt-3">
              <button onClick={() => setQv(p)} className="flex-1 rounded-full border border-violet-200 py-2 text-sm font-bold">Quick view</button>
              <Link href={`/products/${p.slug}`} className="flex-1 rounded-full bg-[#2A2745] py-2 text-center text-sm font-bold text-white">Details</Link>
            </div>
          </div>
        ))}
      </div>

      {qv && (
        <div role="dialog" aria-modal="true" aria-label={qv.name} onClick={() => setQv(null)} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div onClick={(e) => e.stopPropagation()} className="relative grid w-full max-w-2xl gap-5 rounded-3xl bg-white p-5 md:grid-cols-2">
            <button onClick={() => setQv(null)} aria-label="Close" className="absolute right-3 top-3 rounded-full bg-violet-100 p-2"><X size={16} /></button>
            <ProductArt p={qv} />
            <div className="flex flex-col">
              <h2 className="text-2xl font-extrabold">{qv.name}</h2>
              <p className="mt-1 text-lg"><Price p={qv} /></p>
              <p className="mt-2 text-sm text-neutral-600">{qv.description}</p>
              <p className={`mt-2 text-sm font-bold ${qv.in_stock ? "text-emerald-600" : "text-red-600"}`}>{qv.in_stock ? "In stock" : "Out of stock"}</p>
              <Link href={`/products/${qv.slug}`} className="mt-auto rounded-full bg-orange-500 py-3 text-center font-bold text-white">Choose options</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
