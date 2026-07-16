import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../services/http-client";
import { authSession } from "../services/auth-session";
import type { User, UserPreferences } from "../types/api";

const preferences: UserPreferences = {
  excludedGenders: [],
  excludedHairColors: [],
  maxDistance: 80,
  excludedHabits: [],
  strictMode: false,
  excludeTattoos: false,
  excludedTattooLocations: [],
  excludePiercings: false,
  excludedPiercingLocations: [],
  excludeGlasses: false,
  excludedAgeRanges: [],
};

export function RegisterPage() {
  const nav = useNavigate(),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [age, setAge] = useState(18),
    [gender, setGender] = useState(""),
    [error, setError] = useState<string | null>(null),
    [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await request<User>("/auth/register", {
        method: "POST",
        body: { name, email, password, age, gender, preferences },
      });
      authSession.saveLogin(user);
      nav("/discover", { replace: true });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="mx-auto max-w-md pt-12">
      <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
        Redflags web
      </p>
      <h1 className="mt-3 text-4xl font-black">Create an account</h1>
      <form
        onSubmit={submit}
        className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-slate-900 p-6"
      >
        <label className="block">
          Name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label>
            Age
            <input
              required
              min="18"
              type="number"
              value={age}
              onChange={(event) => setAge(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3"
            />
          </label>
          <label>
            Gender
            <select
              required
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3"
            >
              <option value="" disabled>
                Choisir un genre
              </option>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
            </select>
          </label>
        </div>
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
            minLength={8}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-rose-300">
            {error}
          </p>
        )}
        <button
          disabled={loading}
          className="w-full rounded-xl bg-rose-500 p-3 font-bold disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-5 text-center text-slate-400">
        Already registered?{" "}
        <Link to="/" className="text-rose-400 underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
