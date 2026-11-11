"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type State = "loading" | "out" | "denied" | "in";

// The real protection is row level security in Supabase (admin.sql). This screen is the login UI.
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const path = usePathname();

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return setState("out");
      const { data } = await supabase.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
      setState(data ? "in" : "denied");
    }
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { check(); });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setErr(error.message);
  }

  const shell = "fixed inset-0 z-[60] overflow-y-auto bg-[#F4F2FB]";
  if (state === "loading") return <div className={`${shell} grid place-items-center text-neutral-500`}>Loading…</div>;

  if (state === "out")
    return (
      <div className={`${shell} grid place-items-center p-4`}>
        <form onSubmit={login} className="w-full max-w-sm space-y-4 rounded-3xl border border-violet-100 bg-white p-7">
          <h1 className="text-2xl font-extrabold">Admin login</h1>
          <label className="block text-sm font-medium">Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-violet-200 px-3 py-2.5 font-normal" /></label>
          <label className="block text-sm font-medium">Password
            <input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 w-full rounded-xl border border-violet-200 px-3 py-2.5 font-normal" /></label>
          {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
          <button className="w-full rounded-full bg-[#2A2745] py-3 font-bold text-white">Sign in</button>
        </form>
      </div>
    );

  if (state === "denied")
    return (
      <div className={`${shell} grid place-items-center p-4 text-center`}>
        <div className="max-w-sm space-y-3">
          <h1 className="text-2xl font-extrabold">No admin access</h1>
          <p className="text-neutral-600">This account isn’t in the admins table yet. Run the last line of <code>supabase/admin.sql</code> with your email.</p>
          <button onClick={() => supabase.auth.signOut()} className="rounded-full border border-violet-200 bg-white px-6 py-2.5 font-bold">Sign out</button>
        </div>
      </div>
    );

  const tab = (href: string, label: string) => (
    <Link href={href} className={`rounded-full px-4 py-2 font-bold ${path === href ? "bg-[#2A2745] text-white" : "text-neutral-600"}`}>{label}</Link>
  );
  return (
    <div className={shell}>
      <div className="sticky top-0 z-10 border-b border-violet-100 bg-[#F4F2FB]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-5 py-3">
          <b className="mr-3 font-display text-xl">Printling admin</b>
          {tab("/admin", "Products")}{tab("/admin/categories", "Categories")}
          <span className="flex-1" />
          <Link href="/" className="text-neutral-600">View site</Link>
          <button onClick={() => supabase.auth.signOut()} className="ml-3 rounded-full border border-violet-200 bg-white px-4 py-2 font-bold">Sign out</button>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-5 py-8">{children}</div>
    </div>
  );
}
