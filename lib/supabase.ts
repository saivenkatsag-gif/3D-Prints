import { createClient } from "@supabase/supabase-js";

// Placeholders keep the build from crashing before .env.local is filled in.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "anon"
);
