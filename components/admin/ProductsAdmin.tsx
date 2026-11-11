"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/product-types";
import ProductArt from "@/components/ProductArt";

export default function ProductsAdmin() {
  const [items, setItems] = useState<Product[] | null>(null);
  const [err, setErr] = useState("");

  async function load() {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) setErr(error.message);
    setItems((data ?? []) as Product[]);
  }
  useEffect(() => { load(); }, []);

  async function toggle(p: Product, field: "in_stock" | "featured") {
    const { error } = await supabase.from("products").update({ [field]: !p[field] }).eq("id", p.id);
    if (error) return setErr(error.message);
    setItems((cur) => cur!.map((x) => (x.id === p.id ? { ...x, [field]: !p[field] } : x)));
  }
  async function remove(p: Product) {
    if (!window.confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return setErr(error.message);
    setItems((cur) => cur!.filter((x) => x.id !== p.id));
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Products</h1>
        <Link href="/admin/products/new" className="flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 font-bold text-white"><Plus size={16} /> Add product</Link>
      </div>
      {err && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      {!items ? <p className="text-neutral-500">Loading…</p> : !items.length ? <p className="rounded-2xl bg-white p-8 text-center text-neutral-500">No products yet.</p> : (
        <ul className="space-y-3">
          {items.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-3xl border border-violet-100 bg-white p-3">
              <div className="w-16"><ProductArt p={p} /></div>
              <div className="min-w-40 flex-1"><b>{p.name}</b><p className="text-sm text-neutral-500">₹{p.price} · /{p.slug}</p></div>
              <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={p.in_stock} onChange={() => toggle(p, "in_stock")} /> In stock</label>
              <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={p.featured} onChange={() => toggle(p, "featured")} /> Featured</label>
              <Link href={`/admin/products/${p.id}`} aria-label={`Edit ${p.name}`} className="rounded-full border border-violet-200 p-2.5"><Pencil size={16} /></Link>
              <button onClick={() => remove(p)} aria-label={`Delete ${p.name}`} className="rounded-full border border-red-200 p-2.5 text-red-600"><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
