"use client";
import { useState } from "react";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="aspect-square rounded-3xl bg-violet-100" />;
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[i]} alt={name} className="aspect-square w-full rounded-3xl bg-violet-50 object-cover" />
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, n) => (
            <button key={src} onClick={() => setI(n)} aria-label={`Show image ${n + 1}`}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${n === i ? "border-neutral-900" : "border-transparent"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
