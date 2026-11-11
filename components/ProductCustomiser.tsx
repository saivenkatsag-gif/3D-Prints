"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus, ImagePlus, X } from "lucide-react";
import type { Product } from "@/lib/product-types";
import { makeLineId, useCart } from "@/lib/cart-context";
import { ALLOWED, MAX_MB, uploadReference } from "@/lib/uploadReference";

export default function ProductCustomiser({ product: p }: { product: Product }) {
  const c = p.customisation;
  const { items, ready, add, replace } = useCart();
  const router = useRouter();
  const editId = useSearchParams().get("edit");

  const [colours, setColours] = useState<string[]>(c.colours?.[0] ? [c.colours[0].name] : []);
  const [size, setSize] = useState(c.sizes?.[0]?.label ?? "");
  const [text, setText] = useState("");
  const [font, setFont] = useState(c.text?.fonts?.[0] ?? "");
  const [textColour, setTextColour] = useState("");
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);
  const [ref, setRef] = useState<{ url: string; preview: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Edit mode: prefill from the cart line being edited.
  useEffect(() => {
    if (!editId || !ready) return;
    const it = items.find((i) => i.lineId === editId && i.productId === p.id);
    if (!it) return;
    if (it.colour) setColours(it.colour.split(", "));
    if (it.size) setSize(it.size);
    setText(it.text ?? ""); setFont(it.font ?? c.text?.fonts?.[0] ?? "");
    setTextColour(it.textColour ?? ""); setNotes(it.notes ?? "");
    setQty(it.qty);
    if (it.referenceImageUrl) setRef({ url: it.referenceImageUrl, preview: it.referenceImageUrl });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, ready]);

  const sizeObj = c.sizes?.find((s) => s.label === size);
  const unit = sizeObj?.price ?? p.price;
  const multi = !!c.colours?.some((x) => x.multi);

  function pickColour(name: string) {
    setColours((cur) =>
      multi ? (cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name]) : [name]
    );
  }

  async function onFile(f?: File) {
    if (!f) return;
    setError("");
    if (!ALLOWED.includes(f.type)) return setError("Use a JPG, PNG or WEBP image");
    if (f.size > MAX_MB * 1024 * 1024) return setError(`Image must be under ${MAX_MB} MB`);
    setUploading(true);
    try {
      const url = await uploadReference(f);
      setRef({ url, preview: URL.createObjectURL(f) });
    } catch { setError("Upload failed. Please try again."); }
    setUploading(false);
  }

  function submit() {
    if (c.colours?.length && !colours.length) return setError("Choose at least one colour");
    if (c.text && !text.trim()) return setError("Enter the text you want printed");
    setError("");
    const base = {
      productId: p.id,
      colour: colours.join(", ") || undefined,
      size: size || undefined,
      text: text.trim() || undefined,
      font: text.trim() ? font || undefined : undefined,
      textColour: text.trim() ? textColour || undefined : undefined,
      notes: notes.trim() || undefined,
      referenceImageUrl: ref?.url,
    };
    const item = { ...base, lineId: makeLineId(base), name: p.name, slug: p.slug, image: p.images[0] ?? "", unitPrice: unit, qty };
    if (editId) { replace(editId, item); router.push("/cart"); return; }
    add(item); setDone(true); setTimeout(() => setDone(false), 2000);
  }

  const field = "mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2.5";
  return (
    <div className="space-y-5">
      {c.colours && (
        <fieldset>
          <legend className="font-bold">Colour{multi && <span className="ml-1 font-normal text-neutral-500">(pick one or more)</span>}</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {c.colours.map((x) => (
              <button key={x.name} type="button" onClick={() => pickColour(x.name)} aria-pressed={colours.includes(x.name)} aria-label={x.name}
                style={{ background: x.hex }}
                className={`h-9 w-9 rounded-full ring-offset-2 ${colours.includes(x.name) ? "ring-2 ring-neutral-900" : "ring-1 ring-neutral-300"}`} />
            ))}
          </div>
          <p className="mt-2 text-sm text-neutral-600">Selected: {colours.join(", ") || "none"}</p>
        </fieldset>
      )}

      {c.sizes && (
        <fieldset>
          <legend className="font-bold">Size</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {c.sizes.map((s) => (
              <button key={s.label} type="button" onClick={() => setSize(s.label)} aria-pressed={size === s.label}
                className={`rounded-xl border px-4 py-2 text-sm font-bold ${size === s.label ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300"}`}>
                {s.label} · ₹{s.price}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {c.text && (
        <div>
          <label className="font-bold" htmlFor="pt">{c.text.label ?? "Name or message"}</label>
          <input id="pt" value={text} maxLength={c.text.maxLength} onChange={(e) => setText(e.target.value)} className={field} />
          <p className="mt-1 text-xs text-neutral-500">{text.length}/{c.text.maxLength} characters</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {c.text.fonts && (
              <select value={font} onChange={(e) => setFont(e.target.value)} aria-label="Font" className={field}>
                {c.text.fonts.map((f) => <option key={f}>{f}</option>)}
              </select>
            )}
            {c.text.colour && (
              <select value={textColour} onChange={(e) => setTextColour(e.target.value)} aria-label="Text colour" className={field}>
                <option value="">Text colour: any</option>
                {c.colours?.map((x) => <option key={x.name}>{x.name}</option>)}
              </select>
            )}
          </div>
        </div>
      )}

      {c.referenceImage && (
        <div>
          <p className="font-bold">Reference image</p>
          {ref ? (
            <div className="relative mt-2 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ref.preview} alt="Your reference" className="h-28 w-28 rounded-2xl object-cover" />
              <button type="button" onClick={() => setRef(null)} aria-label="Remove image" className="absolute -right-2 -top-2 rounded-full bg-neutral-900 p-1 text-white"><X size={14} /></button>
            </div>
          ) : (
            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
              <ImagePlus size={18} /> {uploading ? "Uploading…" : `Add JPG, PNG or WEBP (max ${MAX_MB} MB)`}
              <input type="file" accept={ALLOWED.join(",")} className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          )}
        </div>
      )}

      {c.notes && (
        <div>
          <label className="font-bold" htmlFor="nt">Special instructions</label>
          <textarea id="nt" rows={3} value={notes} maxLength={300} onChange={(e) => setNotes(e.target.value)} className={field} placeholder="Design requests, finish, anything we should know" />
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-neutral-300">
          <button type="button" aria-label="Decrease quantity" className="p-3" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={16} /></button>
          <span className="w-8 text-center font-bold">{qty}</span>
          <button type="button" aria-label="Increase quantity" className="p-3" onClick={() => setQty((q) => Math.min(99, q + 1))}><Plus size={16} /></button>
        </div>
        <p className="text-2xl font-bold" aria-live="polite">₹{(unit * qty).toLocaleString("en-IN")}</p>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="button" onClick={submit} disabled={!p.in_stock || uploading}
        className="w-full rounded-full bg-orange-500 py-3.5 font-bold text-white disabled:opacity-50">
        {!p.in_stock ? "Out of stock" : editId ? "Save changes" : done ? "Added to cart" : "Add to cart"}
      </button>
    </div>
  );
}
