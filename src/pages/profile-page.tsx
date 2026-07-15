import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { User, UserPreferences } from "../types/api";
const empty: UserPreferences = {
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
export function ProfilePage() {
  const [email] = useState(() => localStorage.getItem("redflags.userEmail")),
    [user, setUser] = useState<User | null>(null),
    [prefs, setPrefs] = useState(JSON.stringify(empty, null, 2)),
    [error, setError] = useState<string | null>(null),
    [notice, setNotice] = useState<string | null>(null),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!email) return;
    void api
      .getMe(email)
      .then((u) => {
        setUser(u);
        setPrefs(JSON.stringify(u.preferences, null, 2));
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Unable to load profile"),
      )
      .finally(() => setLoading(false));
  }, [email]);
  function update<K extends keyof User>(key: K, value: User[K]) {
    setUser((u) => (u ? { ...u, [key]: value } : u));
  }
  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !user) return;
    setSaving(true);
    setError(null);
    try {
      update("images", [...user.images, ...(await api.uploadImages(files))]);
      setNotice("Photos uploaded. Save the profile to persist them.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Photo upload failed",
      );
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user || !email) return;
    let preferences: UserPreferences;
    try {
      preferences = JSON.parse(prefs) as UserPreferences;
    } catch {
      setError("Preferences must be valid JSON.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.updateMe(email, {
        name: user.name,
        age: user.age,
        gender: user.gender,
        bio: user.bio,
        images: user.images,
        preferences,
      } as Parameters<typeof api.updateMe>[1]);
      setUser({ ...user, preferences });
      setNotice("Profile saved.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Profile update failed",
      );
    } finally {
      setSaving(false);
    }
  }
  if (!email)
    return (
      <section className="text-center">
        <h1 className="text-3xl font-bold">Sign in first</h1>
        <Link to="/" className="text-rose-400">
          Login
        </Link>
      </section>
    );
  if (loading)
    return <p className="text-center text-slate-400">Loading profile...</p>;
  if (!user)
    return (
      <p role="alert" className="text-rose-300">
        {error ?? "Profile unavailable."}
      </p>
    );
  return (
    <section className="mx-auto max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
        Account
      </p>
      <h1 className="mb-8 text-3xl font-black">My profile</h1>
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-900 p-6 sm:grid-cols-2">
          <label>
            Email
            <input
              disabled
              value={user.email}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-slate-500"
            />
          </label>
          <label>
            Name
            <input
              required
              value={user.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3"
            />
          </label>
          <label>
            Age
            <input
              required
              min="18"
              type="number"
              value={user.age}
              onChange={(e) => update("age", Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3"
            />
          </label>
          <label>
            Gender
            <input
              required
              value={user.gender}
              onChange={(e) => update("gender", e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3"
            />
          </label>
          <label className="sm:col-span-2">
            Bio
            <textarea
              value={user.bio}
              onChange={(e) => update("bio", e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 p-3"
            />
          </label>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Photos</h2>
            <label className="cursor-pointer rounded-xl bg-white/10 px-4 py-2 text-sm">
              Upload
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={upload}
                className="hidden"
              />
            </label>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {user.images.map((image, index) => (
              <div key={image} className="relative">
                <img
                  src={image}
                  alt={"Photo " + (index + 1)}
                  className="h-36 w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "images",
                      user.images.filter((_, i) => i !== index),
                    )
                  }
                  className="absolute right-2 top-2 rounded bg-slate-950/80 px-2 py-1 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">Preferences</h2>
          <p className="mt-1 text-sm text-slate-400">
            Edit every preference field as JSON.
          </p>
          <textarea
            value={prefs}
            onChange={(e) => setPrefs(e.target.value)}
            rows={14}
            className="mt-4 w-full rounded-xl border border-white/15 bg-slate-950 p-3 font-mono text-sm"
          />
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-rose-500/15 p-4 text-rose-200"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="rounded-xl bg-emerald-500/15 p-4 text-emerald-200"
          >
            {notice}
          </p>
        )}
        <button
          disabled={saving}
          className="rounded-xl bg-rose-500 px-6 py-3 font-bold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  );
}
