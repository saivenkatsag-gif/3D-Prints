import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Printling | 3D printed toys and gifts",
  description: "3D printed toys, fidget gadgets, keychains and custom gifts. Order on WhatsApp.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <CartProvider>
          <div className="bg-[#2A2745] px-3 py-2 text-center text-sm text-white">
            Free gift wrap on every custom order this week. Orders are confirmed on WhatsApp.
          </div>
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
