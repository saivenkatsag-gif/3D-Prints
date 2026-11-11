/* eslint-disable @next/next/no-img-element */
import type { Product } from "@/lib/product-types";

const SHAPES = [
  "rounded-full",
  "rounded-[26%]",
  "rounded-full",
  "rounded-t-full rounded-b-[14%]",
  "rounded-[50%_50%_46%_46%/62%_62%_38%_38%]",
];

// Shows the product photo, or a layered-print placeholder until photos are uploaded.
export default function ProductArt({ p, className = "" }: { p: Pick<Product, "name" | "images" | "customisation">; className?: string }) {
  if (p.images[0]) return <img src={p.images[0]} alt={p.name} className={`aspect-square w-full rounded-2xl object-cover ${className}`} />;
  const hex = p.customisation.colours?.[0]?.hex ?? "#A98BFF";
  const h = [...p.name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <div className={`grid aspect-square w-full place-items-center rounded-2xl bg-violet-100 ${className}`}>
      <i className={`block h-[58%] w-[54%] ${SHAPES[h % SHAPES.length]}`}
        style={{ backgroundColor: hex, backgroundImage: "radial-gradient(circle at 30% 25%,rgba(255,255,255,.45),transparent 40%),repeating-linear-gradient(0deg,rgba(0,0,0,.13) 0 1px,transparent 1px 6px)" }} />
    </div>
  );
}
