// Per-product customisation config, stored as jsonb in products.customisation.
// A field is only shown on the product page when it is present here.
export type Customisation = {
  colours?: { name: string; hex: string; multi?: boolean }[]; // multi: true lets the buyer pick several
  sizes?: { label: string; price: number }[];                 // e.g. Small / Medium / Large
  text?: { label?: string; maxLength: number; fonts?: string[]; colour?: boolean };
  referenceImage?: boolean;
  notes?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  dimensions: string | null;
  material: string | null;
  specs: Record<string, string>;
  in_stock: boolean;
  production_days: string | null;     // e.g. "2 to 4 days"
  customisation: Customisation;
  featured: boolean;
  sales_count: number;
  created_at: string;
};

export type Category = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export const startPrice = (p: Product) =>
  p.customisation.sizes?.length ? Math.min(...p.customisation.sizes.map((s) => s.price)) : p.price;
