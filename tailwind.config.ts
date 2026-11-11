import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { fontFamily: { display: ["'Bricolage Grotesque'", "system-ui", "sans-serif"], sans: ["'DM Sans'", "system-ui", "sans-serif"] } } },
} satisfies Config;
