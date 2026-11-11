"use client";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/product-types";
import { slugify, uploadImage } from "@/lib/admin";

const empty = { name: "", description: "", parent_id: "", image_url: "" };
const inp = "w-full rounded-xl border border-violet-200 bg-white px-3 py-2.5";

export default function CategoriesAdmin() {
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data, error } = await supabase.from("categories").select("*").order("sort_order");
    if (error) setErr(error.message);
    setCats((data ?? []) as Category[]);
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!form.name.trim()) return setErr("Enter a category name");
    setBusy(true);
    const row = { name: form.name.trim(), slug: slugify(form.name), description: form.description.trim() || null, parent_id: form.parent_id || null, image_url: form.image_url || null };
    const { error } = editId
      ? await supabase.from("categories").update(row).eq("id", editId)
      : await supabase.from("categories").insert({ ...row, sort_order: Math.max(0, ...cats.map((c) => c.sort_order)) + 1 });
    setBusy(false);
    if (error) return setErr(error.message);
    setForm(empty); setEditId(null); load();
  }

  async function onImage(f?: File) {
    if (!f) return;
    try { setForm((cur) => ({ ...cur, image_url: "" })); const url = await uploadImage(f, "categories"); setForm((cur) => ({ ...cur, image_url: url })); }
    catch (e) { setErr(e instanceof Error ? e.message : "Upload failed"); }
  }

  async function move(i: number, dir: -1 | 1) {
    const next = [...cats];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setCats(next.map((c, n) => ({ ...c, sort_order: n + 1 })));
    const res = await Promise.all(next.map((c, n) => supabase.from("categories").update({ sort_order: n + 1 }).eq("id", c.id)));
    const bad = res.find((r) => r.error);
    if (bad?.error) { setErr(bad.error.message); load(); }
  }

  async function remove(c: Category) {
    if (!window.confirm(`Delete “${c.name}”? Products stay, but lose this category.`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return setErr(error.message);
    load();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold">Categories</h1>
      {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}

      <form onSubmit={save} className="grid gap-3 rounded-3xl border border-violet-100 bg-white p-5 md:grid-cols-2">
        <h2 className="text-lg font-bold md:col-span-2">{editId ? "Edit category" : "Add category"}</h2>
        <input className={inp} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select className={inp} value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} aria-label="Parent category">
          <option value="">No parent (top level)</option>
          {cats.filter((c) => !c.parent_id && c.id !== editId).map((c) => <option key={c.id} value={c.id}>Subcategory of {c.name}</option>)}
        </select>
        <input className={`${inp} md:col-span-2`} placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
          <ImagePlus size={18} /> {form.image_url ? "Image added (choose another to replace)" : "Add category image"}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onImage(e.target.files?.[0])} />
        </label>
        <div className="flex justify-end gap-2">
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(empty); }} className="rounded-full border border-violet-200 px-5 py-2.5 font-bold">Cancel</button>}
          <button disabled={busy} className="rounded-full bg-[#2A2745] px-6 py-2.5 font-bold text-white disabled:opacity-50">{editId ? "Save changes" : "Add category"}</button>
        </div>
      </form>

      <ul className="space-y-2">
        {cats.map((c, i) => (
          <li key={c.id} className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white p-3">
            <div className="flex flex-col">
              <button onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${c.name} up`} className="disabled:opacity-30"><ArrowUp size={16} /></button>
              <button onClick={() => move(i, 1)} disabled={i === cats.length - 1} aria-label={`Move ${c.name} down`} className="disabled:opacity-30"><ArrowDown size={16} /></button>
            </div>
            {c.image_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={c.image_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
              : <div className="h-12 w-12 rounded-xl bg-violet-100" />}
            <div className="flex-1"><b>{c.name}</b>{c.parent_id && <span className="ml-2 text-xs text-neutral-500">in {cats.find((x) => x.id === c.parent_id)?.name}</span>}<p className="text-sm text-neutral-500">{c.description}</p></div>
            <button onClick={() => { setEditId(c.id); setForm({ name: c.name, description: c.description ?? "", parent_id: c.parent_id ?? "", image_url: c.image_url ?? "" }); scrollTo(0, 0); }} aria-label={`Edit ${c.name}`} className="rounded-full border border-violet-200 p-2.5"><Pencil size={16} /></button>
            <button onClick={() => remove(c)} aria-label={`Delete ${c.name}`} className="rounded-full border border-red-200 p-2.5 text-red-600"><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
