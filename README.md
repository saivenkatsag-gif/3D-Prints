# Printling: 3D printed toys store

Next.js 15 + TypeScript + Tailwind + Supabase. Orders go out through WhatsApp Business. There is no payment gateway.

## Run it
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the Supabase URL and anon key, plus your WhatsApp number (country code first, digits only).
3. In the Supabase SQL editor, run in this order: `supabase/products.sql`, `supabase/storage.sql`, `supabase/admin.sql`, `supabase/seed.sql`.
4. Create your login in Supabase (Authentication, Users, Add user), then run the last line of `supabase/admin.sql` with your email to make that user an admin. Sign in at `/admin`.
5. `npm run dev` and open http://localhost:3000

## Deploy
Push to GitHub, import the repo in Vercel, and add the same four environment variables.

## Structure
- `app/` pages: home, shop, products/[slug], cart, admin
- `components/` Header, Footer, ProductGrid (with Quick View), ShopClient (filters), ProductCustomiser, CartView, CheckoutModal
- `lib/` cart state, WhatsApp message builder, Supabase client, image upload
- `supabase/` schema, storage policy, sample data

## Admin (`/admin`)
Sign in, then add, edit and delete products and categories, reorder categories, upload photos, and set each product's customisation options. Access is enforced by row level security in Supabase.
