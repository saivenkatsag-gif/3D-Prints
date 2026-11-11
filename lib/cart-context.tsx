"use client";
import { createContext, useContext, useEffect, useReducer, useState, ReactNode } from "react";
import type { CartItem } from "./types";
import { subtotal } from "./whatsapp";

const KEY = "printling-cart-v1";
type Action =
  | { t: "load"; items: CartItem[] }
  | { t: "add"; item: CartItem }
  | { t: "remove"; lineId: string }
  | { t: "qty"; lineId: string; qty: number }
  | { t: "replace"; lineId: string; item: CartItem }
  | { t: "clear" };

function reducer(s: CartItem[], a: Action): CartItem[] {
  switch (a.t) {
    case "load": return a.items;
    case "add": {
      const hit = s.find((i) => i.lineId === a.item.lineId);
      return hit
        ? s.map((i) => (i.lineId === hit.lineId ? { ...i, qty: i.qty + a.item.qty } : i))
        : [...s, a.item];
    }
    case "remove": return s.filter((i) => i.lineId !== a.lineId);
    case "qty": return s.map((i) => (i.lineId === a.lineId ? { ...i, qty: Math.max(1, Math.min(99, a.qty)) } : i));
    case "replace": return s.map((i) => (i.lineId === a.lineId ? a.item : i));
    case "clear": return [];
  }
}

type Ctx = {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  add: (i: CartItem) => void;
  remove: (id: string) => void;
  setQty: (id: string, q: number) => void;
  replace: (id: string, i: CartItem) => void;
  clear: () => void;
};
const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ t: "load", items: JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, ready]);

  const value: Ctx = {
    items, ready,
    count: items.reduce((n, i) => n + i.qty, 0),
    total: subtotal(items),
    add: (item) => dispatch({ t: "add", item }),
    remove: (lineId) => dispatch({ t: "remove", lineId }),
    setQty: (lineId, qty) => dispatch({ t: "qty", lineId, qty }),
    replace: (lineId, item) => dispatch({ t: "replace", lineId, item }),
    clear: () => dispatch({ t: "clear" }),
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
};

export const makeLineId = (p: Pick<CartItem, "productId" | "colour" | "size" | "text" | "font" | "textColour" | "notes" | "referenceImageUrl">) =>
  [p.productId, p.colour, p.size, p.text, p.font, p.textColour, p.notes, p.referenceImageUrl].map((x) => x ?? "").join("|");
