"use client";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2, Pencil, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import CheckoutModal from "./CheckoutModal";

export default function CartView() {
  const { items, total, ready, setQty, remove } = useCart();
  const [open, setOpen] = useState(false);

  if (!ready) return <div className="p-10 text-center text-neutral-500">Loading your cart…</div>;
  if (!items.length)
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-neutral-500">Pick a colour, add a name and we’ll print it.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-bold text-white">Shop now</Link>
      </div>
    );

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-5 py-10 lg:grid-cols-[1fr_340px]">
      <ul className="space-y-4">
        {items.map((i) => (
          <li key={i.lineId} className="flex gap-4 rounded-3xl border border-neutral-200 bg-white p-4">
            {i.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={i.image} alt={i.name} className="h-24 w-24 rounded-2xl object-cover" />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-violet-100" />
            )}
            <div className="flex-1 text-sm">
              <Link href={`/products/${i.slug}`} className="text-base font-bold">{i.name}</Link>
              <p className="text-neutral-500">
                {[i.colour, i.size].filter(Boolean).join(" · ")}
                {i.text && <> · “{i.text}”</>}
              </p>
              {i.notes && <p className="text-neutral-500">Note: {i.notes}</p>}
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center rounded-full border">
                  <button aria-label="Decrease" className="p-2" onClick={() => setQty(i.lineId, i.qty - 1)}><Minus size={14} /></button>
                  <span className="w-6 text-center font-bold">{i.qty}</span>
                  <button aria-label="Increase" className="p-2" onClick={() => setQty(i.lineId, i.qty + 1)}><Plus size={14} /></button>
                </div>
                <Link href={`/products/${i.slug}?edit=${encodeURIComponent(i.lineId)}`} className="flex items-center gap-1 text-neutral-600"><Pencil size={14} />Edit</Link>
                <button onClick={() => remove(i.lineId)} className="flex items-center gap-1 text-red-600"><Trash2 size={14} />Remove</button>
              </div>
            </div>
            <p className="font-bold">₹{(i.unitPrice * i.qty).toLocaleString("en-IN")}</p>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-3xl border border-neutral-200 bg-white p-6">
        <div className="flex justify-between text-lg font-bold"><span>Estimated total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
        <p className="mt-1 text-sm text-neutral-500">Delivery charges are confirmed on WhatsApp.</p>
        <button onClick={() => setOpen(true)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#1FAF52] py-3.5 font-bold text-white hover:brightness-110">
          <MessageCircle size={18} /> Order on WhatsApp
        </button>
      </aside>
      {open && <CheckoutModal onClose={() => setOpen(false)} />}
    </div>
  );
}
