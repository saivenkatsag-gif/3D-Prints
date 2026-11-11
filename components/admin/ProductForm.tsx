"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Category, Customisation, Product } from "@/lib/product-types";
import { slugify, uploadImage } from "@/lib/admin";

type F = {
  name: string; slug: string; description: string; price: string; compare: string;
  material: string; dimensions: string; days: string; in_stock: boolean; featured: boolean;
  images: string[]; specs: { k: string; v: string }[]; catIds: string[];
  colours: { name: string; hex: string }[]; multiColour: boolean;
  sizes: { label: string; price: string }[];
  textOn: boolean; textLabel: string; maxLen: string; fonts: string; textColour: boolean;
  refImage: boolean; notes: boolean;
};

const blank: F = {
  name: "", slug: "", description: "", price: "", compare: "", material: "", dimensions: "", days: "",
  in_stock: true, featured: false, images: [], specs: [], catIds: [],
  colours: [], multiColour: false, sizes: [], textOn: false, textLabel: "", maxLen: "12", fonts: "", textColour: false,
  refImage: false, notes: false,
};

const inp = "w-full rounded-xl border border-violet-200 bg-white px-3 py-2.5";
const card = "space-y-3 rounded-3xl border border-violet-100 bg-white p-5";
const Lbl = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm font-medium">{t}<div className="mt-1 font-normal">{children}</div></label>;

function toForm(p: Product, catIds: string[]): F {
  const c = p.customisation ?? {};
  return {
    name: p.name, slug: p.slug, description: p.description ?? "", price: String(p.price), compare: p.compare_at_price ? String(p.compare_at_price) : "",
    material: p.material ?? "", dimensions: p.dimensions ?? "", days: p.production_days ?? "", in_stock: p.in_stock, featured: p.featured,
    images: p.images ?? [], specs: Object.entries(p.specs ?? {}).map(([k, v]) => ({ k, v })), catIds,
    colours: (c.colours ?? []).map((x) => ({ name: x.name, hex: x.hex })), multiColour: !!c.colours?.some((x) => x.multi),
    sizes: (c.sizes ?? []).map((s) => ({ label: s.label, price: String(s.price) })),
    textOn: !!c.text, textLabel: c.text?.label ?? "", maxLen: String(c.text?.maxLength ?? 12), fonts: (c.text?.fonts ?? []).join(", "), textColour: !!c.text?.colour,
    refImage: !!c.referenceImage, notes: !!c.notes,
  };
}

function toCustomisation(f: F): Customisation {
  const c: Customisation = {};
  const colours = f.colours.filter((x) => x.name.trim());
  if (colours.length) c.colours = colours.map((x) => ({ name: x.name.trim(), hex: x.hex, ...(f.multiColour ? { multi: true } : {}) }));
  const sizes = f.sizes.filter((s) => s.label.trim() && Number(s.price) > 0);
  if (sizes.length) c.sizes = sizes.map((s) => ({ label: s.label.trim(), price: Number(s.price) }));
  if (f.textOn) {
    const fonts = f.fonts.split(",").map((x) => x.trim()).filter(Boolean);
    c.text = { maxLength: Math.max(1, Number(f.maxLen) || 12), ...(f.textLabel.trim() ? { label: f.textLabel.trim() } : {}), ...(fonts.length ? { fonts } : {}), ...(f.textColour ? { colour: true } : {}) };
  }
  if (f.refImage) c.referenceImage = true;
  if (f.notes) c.notes = true;
  return c;
}

export default function ProductForm({ id }: { id?: string }) {
  const router = useRouter();
  const [f, setF] = useState<F>(blank);
  const [cats, setCats] = useState<Category[]>([]);
  const [slugTouched, setSlugTouched] = useState(!!id);
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (patch: Partial<F>) => setF((cur) => ({ ...cur, ...patch }));

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from("categories").select("*").order("sort_order");
      setCats((c ?? []) as Category[]);
      if (!id) return;
      const { data: p, error } = await supabase.from("products").select("*").eq("id", id).single<Product>();
      if (error || !p) { setErr(error?.message ?? "Product not found"); setLoading(false); return; }
      const { data: links } = await supabase.from("product_categories").select("category_id").eq("product_id", id);
      setF(toForm(p, (links ?? []).map((l) => l.category_id)));
      setLoading(false);
    })();
  }, [id]);

  async function addImages(files: FileList | null) {
    if (!files?.length) return;
    setErr("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadImage(file, "products"));
      setF((cur) => ({ ...cur, images: [...cur.images, ...urls] }));
    } catch (e) { setErr(e instanceof Error ? e.message : "Upload failed"); }
  }
  const moveImg = (i: number, d: -1 | 1) => setF((cur) => {
    const a = [...cur.images]; const j = i + d;
    if (j < 0 || j >= a.length) return cur;
    [a[i], a[j]] = [a[j], a[i]];
    return { ...cur, images: a };
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!f.name.trim()) return setErr("Enter a product name");
    if (!f.slug.trim()) return setErr("Enter a URL slug");
    if (!(Number(f.price) > 0)) return setErr("Enter a price above 0");
    setBusy(true);
    const row = {
      name: f.name.trim(), slug: slugify(f.slug), description: f.description.trim(), price: Math.round(Number(f.price)),
      compare_at_price: Number(f.compare) > 0 ? Math.round(Number(f.compare)) : null,
      material: f.material.trim() || null, dimensions: f.dimensions.trim() || null, production_days: f.days.trim() || null,
      in_stock: f.in_stock, featured: f.featured, images: f.images,
      specs: Object.fromEntries(f.specs.filter((s) => s.k.trim() && s.v.trim()).map((s) => [s.k.trim(), s.v.trim()])),
      customisation: toCustomisation(f),
    };
    const res = id
      ? await supabase.from("products").update(row).eq("id", id).select("id").single()
      : await supabase.from("products").insert(row).select("id").single();
    if (res.error || !res.data) { setBusy(false); return setErr(res.error?.code === "23505" ? "That URL slug is already used by another product" : res.error?.message ?? "Save failed"); }
    const pid = res.data.id as string;
    const del = await supabase.from("product_categories").delete().eq("product_id", pid);
    if (!del.error && f.catIds.length) {
      const ins = await supabase.from("product_categories").insert(f.catIds.map((category_id) => ({ product_id: pid, category_id })));
      if (ins.error) { setBusy(false); return setErr(ins.error.message); }
    }
    setBusy(false);
    if (del.error) return setErr(del.error.message);
    router.push("/admin");
  }

  if (loading) return <p className="text-neutral-500">Loading…</p>;

  return (
    <form onSubmit={save} className="space-y-6">
      <h1 className="text-3xl font-extrabold">{id ? "Edit product" : "Add product"}</h1>

      <section className={card}>
        <h2 className="text-lg font-bold">Basics</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Lbl t="Name"><input className={inp} value={f.name} onChange={(e) => set({ name: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })} /></Lbl>
          <Lbl t="URL slug"><input className={inp} value={f.slug} onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value }); }} /></Lbl>
          <Lbl t="Price (₹)"><input className={inp} inputMode="numeric" value={f.price} onChange={(e) => set({ price: e.target.value })} /></Lbl>
          <Lbl t="Original price (₹, if discounted)"><input className={inp} inputMode="numeric" value={f.compare} onChange={(e) => set({ compare: e.target.value })} /></Lbl>
        </div>
        <Lbl t="Description"><textarea rows={4} className={inp} value={f.description} onChange={(e) => set({ description: e.target.value })} /></Lbl>
        <div className="flex gap-6">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.in_stock} onChange={(e) => set({ in_stock: e.target.checked })} /> In stock</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured</label>
        </div>
        <p className="text-xs text-neutral-500">If you add sizes below, the size prices replace the base price on the product page.</p>
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <label key={c.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${f.catIds.includes(c.id) ? "border-[#2A2745] bg-[#2A2745] text-white" : "border-violet-200"}`}>
              <input type="checkbox" className="sr-only" checked={f.catIds.includes(c.id)} onChange={() => set({ catIds: f.catIds.includes(c.id) ? f.catIds.filter((x) => x !== c.id) : [...f.catIds, c.id] })} />
              {c.name}
            </label>
          ))}
          {!cats.length && <p className="text-sm text-neutral-500">Add categories first.</p>}
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold">Photos</h2>
        <p className="text-xs text-neutral-500">The first photo is the main one. JPG, PNG or WEBP, up to 5 MB each.</p>
        <div className="flex flex-wrap gap-3">
          {f.images.map((src, i) => (
            <div key={src} className="w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-square w-full rounded-2xl object-cover" />
              <div className="mt-1 flex justify-between">
                <button type="button" aria-label="Move earlier" onClick={() => moveImg(i, -1)}><ArrowLeft size={16} /></button>
                <button type="button" aria-label="Remove photo" onClick={() => set({ images: f.images.filter((x) => x !== src) })} className="text-red-600"><X size={16} /></button>
                <button type="button" aria-label="Move later" onClick={() => moveImg(i, 1)}><ArrowRight size={16} /></button>
              </div>
            </div>
          ))}
          <label className="grid h-28 w-28 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-violet-200 text-center text-sm text-neutral-500">
            <span><ImagePlus className="mx-auto" size={20} />Add photos</span>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { addImages(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold">Details</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Lbl t="Material"><input className={inp} value={f.material} onChange={(e) => set({ material: e.target.value })} placeholder="PLA" /></Lbl>
          <Lbl t="Dimensions"><input className={inp} value={f.dimensions} onChange={(e) => set({ dimensions: e.target.value })} placeholder="Medium: 28 cm long" /></Lbl>
          <Lbl t="Production time"><input className={inp} value={f.days} onChange={(e) => set({ days: e.target.value })} placeholder="2 to 4 days" /></Lbl>
        </div>
        <p className="text-sm font-medium">Other specifications</p>
        {f.specs.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input className={inp} placeholder="Label" value={s.k} onChange={(e) => set({ specs: f.specs.map((x, n) => (n === i ? { ...x, k: e.target.value } : x)) })} />
            <input className={inp} placeholder="Value" value={s.v} onChange={(e) => set({ specs: f.specs.map((x, n) => (n === i ? { ...x, v: e.target.value } : x)) })} />
            <button type="button" aria-label="Remove row" onClick={() => set({ specs: f.specs.filter((_, n) => n !== i) })}><X size={16} /></button>
          </div>
        ))}
        <button type="button" onClick={() => set({ specs: [...f.specs, { k: "", v: "" }] })} className="flex items-center gap-1 text-sm font-bold"><Plus size={14} /> Add specification</button>
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold">Customisation options</h2>
        <p className="text-xs text-neutral-500">Only the options you set up here appear on this product’s page.</p>

        <p className="text-sm font-medium">Colours</p>
        {f.colours.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="color" aria-label="Colour" value={c.hex} onChange={(e) => set({ colours: f.colours.map((x, n) => (n === i ? { ...x, hex: e.target.value } : x)) })} className="h-10 w-12 rounded-lg" />
            <input className={inp} placeholder="Colour name" value={c.name} onChange={(e) => set({ colours: f.colours.map((x, n) => (n === i ? { ...x, name: e.target.value } : x)) })} />
            <button type="button" aria-label="Remove colour" onClick={() => set({ colours: f.colours.filter((_, n) => n !== i) })}><X size={16} /></button>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-5">
          <button type="button" onClick={() => set({ colours: [...f.colours, { name: "", hex: "#4F7CFF" }] })} className="flex items-center gap-1 text-sm font-bold"><Plus size={14} /> Add colour</button>
          {f.colours.length > 1 && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.multiColour} onChange={(e) => set({ multiColour: e.target.checked })} /> Buyer can pick several colours</label>}
        </div>

        <p className="pt-2 text-sm font-medium">Sizes and prices</p>
        {f.sizes.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input className={inp} placeholder="Size name (Small)" value={s.label} onChange={(e) => set({ sizes: f.sizes.map((x, n) => (n === i ? { ...x, label: e.target.value } : x)) })} />
            <input className={inp} inputMode="numeric" placeholder="Price ₹" value={s.price} onChange={(e) => set({ sizes: f.sizes.map((x, n) => (n === i ? { ...x, price: e.target.value } : x)) })} />
            <button type="button" aria-label="Remove size" onClick={() => set({ sizes: f.sizes.filter((_, n) => n !== i) })}><X size={16} /></button>
          </div>
        ))}
        <div className="flex gap-4">
          <button type="button" onClick={() => set({ sizes: [...f.sizes, { label: "", price: "" }] })} className="flex items-center gap-1 text-sm font-bold"><Plus size={14} /> Add size</button>
          {!f.sizes.length && <button type="button" onClick={() => set({ sizes: [{ label: "Small", price: "" }, { label: "Medium", price: "" }, { label: "Large", price: "" }] })} className="text-sm text-neutral-600 underline">Use Small / Medium / Large</button>}
        </div>

        <label className="flex items-center gap-2 pt-2 font-medium"><input type="checkbox" checked={f.textOn} onChange={(e) => set({ textOn: e.target.checked })} /> Personalised text (name or message)</label>
        {f.textOn && (
          <div className="grid gap-3 md:grid-cols-2">
            <Lbl t="Field label"><input className={inp} value={f.textLabel} onChange={(e) => set({ textLabel: e.target.value })} placeholder="Name on keychain" /></Lbl>
            <Lbl t="Character limit"><input className={inp} inputMode="numeric" value={f.maxLen} onChange={(e) => set({ maxLen: e.target.value })} /></Lbl>
            <Lbl t="Fonts (comma separated, optional)"><input className={inp} value={f.fonts} onChange={(e) => set({ fonts: e.target.value })} placeholder="Rounded, Block" /></Lbl>
            <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={f.textColour} onChange={(e) => set({ textColour: e.target.checked })} /> Let buyer choose text colour</label>
          </div>
        )}
        <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={f.refImage} onChange={(e) => set({ refImage: e.target.checked })} /> Reference image upload</label>
        <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={f.notes} onChange={(e) => set({ notes: e.target.checked })} /> Special instructions box</label>
      </section>

      {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      <div className="flex gap-3">
        <button disabled={busy} className="rounded-full bg-orange-500 px-8 py-3 font-bold text-white disabled:opacity-50">{busy ? "Saving…" : "Save product"}</button>
        <button type="button" onClick={() => router.push("/admin")} className="rounded-full border border-violet-200 bg-white px-8 py-3 font-bold">Cancel</button>
      </div>
    </form>
  );
}
