"use client";
import { useEffect, useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useUser } from "@/lib/use-user";
import { buildWhatsAppUrl, validateCustomer } from "@/lib/whatsapp";
import type { Customer } from "@/lib/types";

const empty: Customer = { name: "", phone: "", address: "", city: "", pin: "" };
const fields: { k: keyof Customer; label: string; type?: string; mode?: "numeric" | "tel" }[] = [
  { k: "name", label: "Full name" },
  { k: "phone", label: "Mobile number", type: "tel", mode: "tel" },
  { k: "address", label: "Delivery address" },
  { k: "city", label: "City" },
  { k: "pin", label: "PIN code", mode: "numeric" },
];

export default function CheckoutModal({ onClose }: { onClose: () => void }) {
  const { items, total, clear } = useCart();
  const { user } = useUser();
  const [c, setC] = useState<Customer>(empty);
  const [err, setErr] = useState<Partial<Record<keyof Customer, string>>>({});

  // Signed-in customers get their name and mobile number filled in.
  useEffect(() => {
    if (!user) return;
    setC((cur) => ({ ...cur, name: cur.name || user.user_metadata?.full_name || "", phone: cur.phone || user.user_metadata?.phone || "" }));
  }, [user]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validateCustomer(c);
    setErr(v);
    if (Object.keys(v).length) return;
    window.open(buildWhatsAppUrl(items, c), "_blank", "noopener");
    clear();
    onClose();
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Order on WhatsApp" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <form onSubmit={submit} className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full bg-neutral-100 p-2"><X size={16} /></button>
        <h2 className="text-xl font-bold">Where should we deliver?</h2>

        <div className="mt-4 space-y-1 rounded-2xl bg-neutral-50 p-4 text-sm">
          {items.map((i) => (
            <div key={i.lineId} className="flex justify-between">
              <span>{i.qty} × {i.name}{i.colour ? ` (${i.colour})` : ""}</span>
              <span>₹{(i.unitPrice * i.qty).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 font-bold"><span>Estimated total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
        </div>

        <div className="mt-4 space-y-3">
          {fields.map((f) => (
            <label key={f.k} className="block text-sm font-medium">
              {f.label}
              <input
                value={c[f.k]} type={f.type ?? "text"} inputMode={f.mode}
                onChange={(e) => setC({ ...c, [f.k]: e.target.value })}
                aria-invalid={!!err[f.k]}
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2.5 font-normal"
              />
              {err[f.k] && <span className="text-xs text-red-600">{err[f.k]}</span>}
            </label>
          ))}
        </div>

        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#1FAF52] py-3.5 font-bold text-white">
          <MessageCircle size={18} /> Send order on WhatsApp
        </button>
        <p className="mt-3 text-center text-xs text-neutral-500">
          No payment is taken on this site. Your order is confirmed after we chat on WhatsApp.
        </p>
      </form>
    </div>
  );
}
