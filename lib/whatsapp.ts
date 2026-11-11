import type { CartItem, Customer } from "./types";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
export const subtotal = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

export function validateCustomer(c: Customer) {
  const e: Partial<Record<keyof Customer, string>> = {};
  if (c.name.trim().length < 2) e.name = "Enter your full name";
  if (!/^[6-9]\d{9}$/.test(c.phone.replace(/\s/g, ""))) e.phone = "Enter a 10-digit mobile number";
  if (c.address.trim().length < 8) e.address = "Enter your delivery address";
  if (c.city.trim().length < 2) e.city = "Enter your city";
  if (!/^\d{6}$/.test(c.pin)) e.pin = "Enter a 6-digit PIN code";
  return e;
}

export function buildOrderMessage(items: CartItem[], c: Customer, siteUrl: string) {
  const lines = items.map((i, n) => {
    const l = [`*${n + 1}. ${i.name}*`];
    if (i.colour) l.push(`Colour: ${i.colour}`);
    if (i.size) l.push(`Size: ${i.size}`);
    if (i.text) l.push(`Personalised text: ${i.text}${i.font ? ` (font: ${i.font})` : ""}${i.textColour ? ` (text colour: ${i.textColour})` : ""}`);
    if (i.notes) l.push(`Notes: ${i.notes}`);
    l.push(`Quantity: ${i.qty}`);
    l.push(`Unit price: ${inr(i.unitPrice)}`);
    l.push(`Subtotal: ${inr(i.unitPrice * i.qty)}`);
    l.push(`Product link: ${siteUrl}/products/${i.slug}`);
    if (i.referenceImageUrl) l.push(`Reference image: ${i.referenceImageUrl}`);
    return l.join("\n");
  });
  return [
    "Hello! I would like to place an order.",
    "",
    "*Order details*",
    lines.join("\n\n"),
    "",
    `*Estimated total: ${inr(subtotal(items))}* (excluding delivery)`,
    "",
    "*Customer details*",
    `Name: ${c.name.trim()}`,
    `Phone: ${c.phone.trim()}`,
    `Address: ${c.address.trim()}, ${c.city.trim()} - ${c.pin}`,
    "",
    "Please confirm availability, delivery charges and order processing time.",
  ].join("\n");
}

export function buildWhatsAppUrl(items: CartItem[], c: Customer) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) throw new Error("NEXT_PUBLIC_WHATSAPP_NUMBER is not set");
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return `https://wa.me/${number}?text=${encodeURIComponent(buildOrderMessage(items, c, site))}`;
}
