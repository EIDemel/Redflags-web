import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApi } from "../hooks/use-api";
import { api } from "../services/api";
import { authSession } from "../services/auth-session";

export function AuthLoginPage() {
  const nav = useNavigate(),
    location = useLocation(),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    login = useApi(api.login);
  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const response = await login.execute(email, password);
      authSession.saveLogin(response);
      const from =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname ?? "/discover";
      nav(from, { replace: true });
    } catch {}
  }
  return (
    <section className="mx-auto max-w-md pt-12">
      <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
        Redflags web
      </p>
      <h1 className="mt-3 text-4xl font-black">Sign in</h1>
      <form
        onSubmit={submit}
        className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-slate-900 p-6"
      >
        <label className="block">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3"
          />
        </label>
        <label className="block">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3"
          />
        </label>
        {login.error && (
          <p role="alert" className="text-sm text-rose-300">
            {login.error}
          </p>
        )}
        <button
          disabled={login.isLoading}
          className="w-full rounded-xl bg-rose-500 p-3 font-bold"
        >
          {login.isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </section>
  );
}
