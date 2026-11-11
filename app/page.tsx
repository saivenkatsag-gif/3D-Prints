import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Category, Product } from "@/lib/product-types";
import ProductGrid from "@/components/ProductGrid";
import HeroObject from "@/components/HeroObject";
import ProductArt from "@/components/ProductArt";

export const revalidate = 60;

const btn = "inline-block rounded-full px-7 py-3.5 font-bold transition-transform hover:-translate-y-0.5";
const Title = ({ children, href }: { children: React.ReactNode; href?: string }) => (
  <div className="mb-5 flex items-end justify-between">
    <h2 className="text-3xl font-extrabold md:text-4xl">{children}</h2>
    {href && <Link href={href} className="text-neutral-500">See all</Link>}
  </div>
);

export default async function Home() {
  const [{ data: cats }, { data: prods }] = await Promise.all([
    supabase.from("categories").select("*").is("parent_id", null).order("sort_order"),
    supabase.from("products").select("*"),
  ]);
  const categories = (cats ?? []) as Category[];
  const products = (prods ?? []) as Product[];
  const trending = [...products].sort((a, b) => Number(b.featured) - Number(a.featured) || b.sales_count - a.sales_count).slice(0, 4);
  const fresh = [...products].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4);
  const best = [...products].sort((a, b) => b.sales_count - a.sales_count).slice(0, 4);
  const custom = products.filter((p) => p.customisation.text || p.customisation.referenceImage).slice(0, 4);

  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-14 md:grid-cols-[1.05fr_.95fr]">
        <div>
          <h1 className="text-5xl font-extrabold leading-[1.05] md:text-7xl">Toys printed layer by layer, made for you.</h1>
          <p className="mb-7 mt-5 max-w-md text-lg text-neutral-600">Flexi dragons, fidget gadgets, name keychains and desk companions. Pick a colour, add a name, and we print it.</p>
          <Link href="/shop" className={`${btn} bg-orange-500 text-white`}>Shop now</Link>{" "}
          <Link href="/shop" className={`${btn} border border-violet-200 bg-white`}>Explore products</Link>
        </div>
        <HeroObject />
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-10">
          <Title href="/shop">Shop by category</Title>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {categories.map((c) => (
              <Link key={c.id} href={`/shop?category=${c.slug}`} className="rounded-3xl border border-violet-100 bg-white p-3 transition-transform hover:-translate-y-1">
                <div className="mb-2 grid h-20 place-items-center rounded-2xl bg-violet-100">
                  <i className="h-10 w-10 rounded-full bg-orange-400" style={{ backgroundImage: "repeating-linear-gradient(0deg,rgba(0,0,0,.13) 0 1px,transparent 1px 6px)" }} />
                </div>
                <b className="block font-display">{c.name}</b>
                <span className="text-sm text-neutral-500">{c.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-10"><Title href="/shop">Trending now</Title><ProductGrid products={trending} /></section>
      <section className="mx-auto max-w-6xl px-5 py-10"><Title href="/shop">New arrivals</Title><ProductGrid products={fresh} /></section>
      <section className="mx-auto max-w-6xl px-5 py-10"><Title href="/shop">Best sellers</Title><ProductGrid products={best} /></section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid items-center gap-8 rounded-[40px] bg-[#2A2745] p-8 text-white md:grid-cols-2 md:p-10">
          <div>
            <h2 className="text-4xl font-extrabold">Make it yours</h2>
            <p className="mb-6 mt-3 max-w-md opacity-80">Add a name, choose a size and upload a reference picture. Only the options that fit each product show up, so ordering stays quick.</p>
            <Link href="/shop?category=customised-gifts" className={`${btn} bg-orange-500`}>Browse custom gifts</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">{custom.slice(0, 4).map((p) => <ProductArt key={p.id} p={p} />)}</div>
        </div>
      </section>

      <section id="why" className="mx-auto max-w-6xl px-5 py-10">
        <Title>Why choose us</Title>
        <div className="grid gap-4 md:grid-cols-4">
          {[["Printed to order", "Every piece is printed fresh in your colours."], ["Strong plastic", "PLA and PETG that survive pockets and desks."], ["Custom without the wait", "Most names and designs ship in 2 to 4 days."], ["Order on WhatsApp", "Talk to a real person. No payment form, no surprises."]].map(([t, d]) => (
            <div key={t} className="rounded-3xl border border-violet-100 bg-white p-5"><b className="font-display text-lg">{t}</b><p className="mt-1 text-neutral-600">{d}</p></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <Title>Loved by collectors</Title>
        <div className="grid gap-4 md:grid-cols-3">
          {[["The flexi dragon is unreal. Every joint moves and the colour looks great on my desk.", "Ananya, Hyderabad"], ["Ordered 20 name keychains for a school event. Everything arrived neat and on time.", "Ravi, Vijayawada"], ["Sent a sketch on WhatsApp and got a mini figure that looked just like it.", "Sneha, Guntur"]].map(([q, n]) => (
            <blockquote key={n} className="rounded-3xl bg-[#E9E4FF] p-6">{q}<cite className="mt-3 block text-sm not-italic text-neutral-600">{n}</cite></blockquote>
          ))}
        </div>
      </section>

      {products.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-10">
          <Title>On our Instagram</Title>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">{products.slice(0, 6).map((p) => <ProductArt key={p.id} p={p} />)}</div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-[40px] bg-orange-500 p-8 text-white md:p-10">
          <h2 className="text-3xl font-extrabold">New drops, first to know.</h2>
          <form action="mailto:hello@printling.in" method="post" encType="text/plain" className="flex gap-2">
            <input type="email" name="email" required placeholder="Your email" aria-label="Email" className="min-w-56 rounded-full px-5 py-3 text-neutral-900" />
            <button className="rounded-full bg-[#2A2745] px-6 py-3 font-bold">Subscribe</button>
          </form>
        </div>
      </section>
    </main>
  );
}
