"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useUser } from "@/lib/use-user";

export default function Header() {
  const { count } = useCart();
  const { user } = useUser();
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <header className="sticky top-0 z-30 border-b border-violet-100 bg-[#F4F2FB]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-5 px-5">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-extrabold">
          <span className="h-5 w-5 rounded-md bg-orange-500" aria-hidden />Printling
        </Link>
        <nav className="ml-3 hidden gap-5 font-medium text-neutral-600 md:flex">
          <Link href="/shop">Shop</Link>
          <Link href="/shop?category=customised-gifts">Custom gifts</Link>
          <Link href="/#why">Why us</Link>
        </nav>
        <span className="flex-1" />
        <form onSubmit={(e) => { e.preventDefault(); router.push(`/shop?q=${encodeURIComponent(q)}`); }}
          className="hidden h-10 w-60 items-center gap-2 rounded-full border border-violet-100 bg-white px-4 md:flex">
          <Search size={16} className="text-neutral-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search toys, keychains…" aria-label="Search products" className="w-full bg-transparent outline-none" />
        </form>
        <Link href="/account" className="flex h-10 items-center gap-2 rounded-full border border-violet-100 bg-white px-4 font-bold">
          <User size={16} /><span className="hidden sm:inline">{user ? (user.user_metadata?.full_name?.split(" ")[0] ?? "Account") : "Sign in"}</span>
        </Link>
        <Link href="/cart" className="flex h-10 items-center gap-2 rounded-full bg-[#2A2745] px-4 font-bold text-white">
          <ShoppingBag size={16} /> Cart <span>{count}</span>
        </Link>
      </div>
    </header>
  );
}
