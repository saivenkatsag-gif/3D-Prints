import Link from "next/link";

export default function Footer() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return (
    <footer className="mt-16 border-t border-violet-100 py-10 text-sm text-neutral-600">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-extrabold text-[#2A2745]">Printling</p>
          <p className="mt-2 max-w-xs">3D printed toys and custom gifts. Orders are confirmed after we chat on WhatsApp.</p>
        </div>
        <div className="space-y-1"><b className="text-[#2A2745]">Shop</b><Link className="block" href="/shop">All products</Link><Link className="block" href="/shop?category=keychains">Keychains</Link><Link className="block" href="/shop?category=fidget-toys">Fidget toys</Link></div>
        <div className="space-y-1"><b className="text-[#2A2745]">Help</b><p>Shipping</p><p>Returns</p><p>Privacy</p></div>
        <div className="space-y-1"><b className="text-[#2A2745]">Contact</b>{wa && <a className="block" href={`https://wa.me/${wa}`}>WhatsApp us</a>}<p>Instagram</p></div>
      </div>
    </footer>
  );
}
