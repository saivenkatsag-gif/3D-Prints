"use client";
import { useState } from "react";

const COLOURS = [["Blue", "#4F7CFF"], ["Coral", "#FF6B5E"], ["Mint", "#2FCB97"], ["Lilac", "#A98BFF"], ["Sun", "#FFC933"]];

export default function HeroObject() {
  const [hex, setHex] = useState(COLOURS[0][1]);
  return (
    <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[42px] bg-[#E9E4FF]">
      <i className="bob block h-[62%] w-[56%] rounded-[50%_50%_46%_46%/62%_62%_38%_38%] transition-colors duration-300"
        style={{ backgroundColor: hex, backgroundImage: "radial-gradient(circle at 30% 25%,rgba(255,255,255,.45),transparent 40%),repeating-linear-gradient(0deg,rgba(0,0,0,.13) 0 1px,transparent 1px 6px)" }} />
      <div className="absolute bottom-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-neutral-500">
        Try a colour
        {COLOURS.map(([n, h]) => (
          <button key={n} aria-label={n} aria-pressed={hex === h} onClick={() => setHex(h)}
            className={`h-6 w-6 rounded-full ring-offset-2 ${hex === h ? "ring-2 ring-[#2A2745]" : "ring-1 ring-neutral-300"}`} style={{ background: h }} />
        ))}
      </div>
    </div>
  );
}
