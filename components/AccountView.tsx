"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/use-user";

type Mode = "login" | "register";
const inp = "mt-1 w-full rounded-xl border border-violet-200 bg-white px-3 py-2.5 font-normal";

export default function AccountView() {
  const { user, ready } = useUser();
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<"details" | "code">("details");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    setMsg("");
    const em = email.trim().toLowerCase();
    const ph = phone.replace(/\s/g, "");
    if (!/^\S+@\S+\.\S+$/.test(em)) return setMsg("Enter a valid email address");
    if (mode === "register") {
      if (name.trim().length < 2) return setMsg("Enter your full name");
      if (!/^[6-9]\d{9}$/.test(ph)) return setMsg("Enter a 10-digit mobile number");
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: em,
      options: mode === "register"
        ? { shouldCreateUser: true, data: { full_name: name.trim(), phone: ph } }
        : { shouldCreateUser: false },
    });
    setBusy(false);
    if (error) {
      const m = error.message.toLowerCase();
      return setMsg(
        m.includes("signups not allowed") || m.includes("not found")
          ? "No account found for this email. Please register first."
          : error.status === 429 || m.includes("rate limit") || m.includes("seconds")
          ? "Too many requests. Please wait a minute and try again."
          : "Could not send the code. Please try again."
      );
    }
    setEmail(em); setCode(""); setStep("code"); setWait(30);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!/^\d{6,10}$/.test(code.trim())) return setMsg("Enter the code from your email");
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    setBusy(false);
    if (error) setMsg("That code is wrong or has expired. Request a new one.");
    // On success the session starts and useUser() switches this page to the account view.
  }

  if (!ready) return <p className="text-center text-neutral-500">Loading…</p>;

  if (user)
    return (
      <div className="space-y-5 rounded-3xl border border-violet-100 bg-white p-7">
        <h1 className="text-2xl font-extrabold">Hi, {user.user_metadata?.full_name || "there"}</h1>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-neutral-500">Email</dt><dd className="font-medium">{user.email}</dd></div>
          {user.user_metadata?.phone && <div className="flex justify-between"><dt className="text-neutral-500">Mobile</dt><dd className="font-medium">{user.user_metadata.phone}</dd></div>}
        </dl>
        <p className="text-sm text-neutral-600">Your name and mobile number fill in automatically when you order on WhatsApp.</p>
        <div className="flex gap-3">
          <Link href="/shop" className="flex-1 rounded-full bg-orange-500 py-3 text-center font-bold text-white">Continue shopping</Link>
          <button onClick={() => supabase.auth.signOut()} className="flex-1 rounded-full border border-violet-200 py-3 font-bold">Sign out</button>
        </div>
      </div>
    );

  const tab = (m: Mode, label: string) => (
    <button type="button" onClick={() => { setMode(m); setStep("details"); setMsg(""); }} aria-pressed={mode === m}
      className={`flex-1 rounded-full py-2 font-bold ${mode === m ? "bg-[#2A2745] text-white" : "text-neutral-600"}`}>{label}</button>
  );

  return (
    <div className="space-y-5 rounded-3xl border border-violet-100 bg-white p-7">
      <div className="flex gap-1 rounded-full bg-violet-50 p-1">{tab("login", "Sign in")}{tab("register", "Create account")}</div>

      {step === "details" ? (
        <form onSubmit={send} className="space-y-4">
          <h1 className="text-2xl font-extrabold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          {mode === "register" && (
            <>
              <label className="block text-sm font-medium">Full name<input className={inp} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
              <label className="block text-sm font-medium">Mobile number<input className={inp} value={phone} inputMode="tel" onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></label>
            </>
          )}
          <label className="block text-sm font-medium">Email<input type="email" className={inp} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
          <button disabled={busy} className="w-full rounded-full bg-[#2A2745] py-3 font-bold text-white disabled:opacity-50">{busy ? "Sending…" : "Send code to my email"}</button>
          <p className="text-center text-xs text-neutral-500">We email you a one-time code each time you sign in. No password needed.</p>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <h1 className="text-2xl font-extrabold">Check your email</h1>
          <p className="text-sm text-neutral-600">We sent a code to <b>{email}</b>. Enter it below.</p>
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} inputMode="numeric" autoComplete="one-time-code" maxLength={10}
            aria-label="Verification code" placeholder="Enter code" className={`${inp} text-center text-2xl font-bold tracking-[.3em]`} autoFocus />
          {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
          <button disabled={busy} className="w-full rounded-full bg-orange-500 py-3 font-bold text-white disabled:opacity-50">{busy ? "Checking…" : mode === "login" ? "Sign in" : "Verify and create account"}</button>
          <div className="flex justify-between text-sm">
            <button type="button" onClick={() => { setStep("details"); setMsg(""); }} className="text-neutral-600 underline">Change email</button>
            <button type="button" disabled={wait > 0 || busy} onClick={() => send()} className="font-bold disabled:text-neutral-400">{wait > 0 ? `Resend in ${wait}s` : "Resend code"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
