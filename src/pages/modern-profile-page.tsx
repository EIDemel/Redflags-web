import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../services/http-client";
import { authSession } from "../services/auth-session";
import { api } from "../services/api";
import {
  profileService,
  type ProfileUpdate,
} from "../services/profile-service";
import type { UserPreferences } from "../types/api";

const base = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
const defaults: UserPreferences = {
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
const genders: [string, string][] = [
  ["male", "Men"],
  ["female", "Women"],
  ["non-binary", "Non binary"],
];
const ages: [string, string][] = [
  ["18-25", "18 - 25"],
  ["26-35", "26 - 35"],
  ["36-45", "36 - 45"],
  ["46+", "46+"],
];
const hairs: [string, string][] = [
  ["brunette", "Brunette"],
  ["blonde", "Blonde"],
  ["redhead", "Redhead"],
  ["black", "Black"],
  ["grey", "Grey"],
];

function Chips({
  items,
  value,
  onChange,
}: {
  items: [string, string][];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map(([id, label]) => (
        <button
          type="button"
          key={id}
          onClick={() =>
            onChange(
              value.includes(id)
                ? value.filter((x) => x !== id)
                : [...value, id],
            )
          }
          className={
            "rounded-full border-2 px-4 py-2 font-bold shadow-[0_4px_0_rgba(0,0,0,.15)] " +
            (value.includes(id)
              ? "border-rose-500 bg-rose-500 text-white"
              : "border-slate-800 bg-slate-50 text-slate-700")
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-5">
      <span className="text-lg font-bold">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={
          "relative h-10 w-20 rounded-full border-2 " +
          (value
            ? "border-rose-500 bg-rose-200"
            : "border-stone-400 bg-slate-100")
        }
      >
        <span
          className={
            "absolute top-1 h-7 w-7 rounded-full " +
            (value ? "left-10 bg-rose-500" : "left-1 bg-slate-300")
          }
        />
      </button>
    </div>
  );
}
export function ModernProfilePage() {
  const nav = useNavigate(),
    email = localStorage.getItem("redflags.userEmail"),
    [form, setForm] = useState<ProfileUpdate | null>(null),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [uploading, setUploading] = useState(false),
    [habits, setHabits] = useState<[string, string][]>([]),
    [error, setError] = useState<string | null>(null),
    [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    void api
      .getRedFlags()
      .then((flags) => setHabits(flags.map((flag) => [flag.key, flag.label])))
      .catch(() => setHabits([]));
  }, []);
  useEffect(() => {
    if (!email) return;
    void profileService
      .get(email)
      .then((user) =>
        setForm({
          name: user.name,
          age: user.age,
          gender: user.gender,
          bio: user.bio,
          preferences: { ...defaults, ...user.preferences },
          images: user.images,
        }),
      )
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Unable to load profile."),
      )
      .finally(() => setLoading(false));
  }, [email]);
  if (!email) return null;
  if (loading)
    return (
      <p className="p-10 text-center text-slate-400">Loading profile...</p>
    );
  if (!form)
    return (
      <p className="p-10 text-center text-rose-500">
        {error ?? "Profile unavailable."}
      </p>
    );
  const current = form,
    accountEmail = email;
  const update = (patch: Partial<ProfileUpdate>) =>
    setForm((current) => (current ? { ...current, ...patch } : current));
  const prefs = (patch: Partial<UserPreferences>) =>
    setForm((current) =>
      current
        ? { ...current, preferences: { ...current.preferences, ...patch } }
        : current,
    );
  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    if (current.images.length + files.length > 9) {
      setError("Maximum 9 photos.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const uploaded = await profileService.upload(files);
      update({ images: [...current.images, ...uploaded] });
      setNotice("Photos uploaded. Save to apply changes.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await profileService.update(accountEmail, current);
      setNotice("Changes saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }
  async function deleteAccount() {
    if (!window.confirm("Delete your account permanently?")) return;
    try {
      await request("/auth/me", { method: "DELETE" }, { email: accountEmail });
      authSession.clear();
      nav("/", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
  }
  return (
    <form
      onSubmit={save}
      className="min-h-screen bg-white pb-32 text-slate-900"
    >
      <main className="mx-auto max-w-2xl space-y-10 px-5 py-8">
        <section>
          <h2 className="text-2xl font-black">MY INFORMATION</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <input
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              className="rounded-2xl border-2 p-3 font-bold"
              placeholder="Name"
            />
            <input
              min="18"
              type="number"
              value={form.age}
              onChange={(e) => update({ age: Number(e.target.value) })}
              className="rounded-2xl border-2 p-3 font-bold"
            />
            <input
              value={form.gender}
              onChange={(e) => update({ gender: e.target.value })}
              className="rounded-2xl border-2 p-3 font-bold"
              placeholder="Gender"
            />
          </div>
        </section>
        <section>
          <h3 className="font-black uppercase tracking-wide text-slate-500">
            YOUR PHOTOS
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }, (_, i) => {
              const path = form.images[i];
              return (
                <div
                  key={i}
                  className="relative aspect-[.78] overflow-hidden rounded-3xl border-2 border-slate-200 bg-slate-50"
                >
                  {path ? (
                    <>
                      <img
                        src={path.startsWith("http") ? path : base + path}
                        alt={"Photo " + (i + 1)}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          update({
                            images: form.images.filter((_, x) => x !== i),
                          })
                        }
                        className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
                      >
                        X
                      </button>
                      {i === 0 && (
                        <span className="absolute inset-x-0 bottom-0 bg-rose-500 py-1 text-center text-xs font-black text-white">
                          MAIN
                        </span>
                      )}
                    </>
                  ) : (
                    <label className="grid h-full cursor-pointer place-items-center text-4xl text-slate-400">
                      +
                      <input
                        className="hidden"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={addPhotos}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
          {uploading && <p className="mt-3 text-rose-500">Uploading...</p>}
        </section>
        <section>
          <h3 className="font-black uppercase tracking-wide text-slate-500">
            MY BIO
          </h3>
          <textarea
            maxLength={250}
            rows={5}
            value={form.bio}
            onChange={(e) => update({ bio: e.target.value })}
            placeholder="Tell us about yourself..."
            className="mt-4 w-full rounded-3xl border-2 border-slate-200 bg-slate-50 p-5 text-xl font-semibold"
          />
          <p className="text-right text-slate-500">{form.bio.length}/250</p>
        </section>
        <section className="border-t-2 pt-8">
          <h2 className="text-2xl font-black">MY RED FLAGS</h2>
          <h3 className="mt-8 font-black uppercase text-slate-500">
            EXCLUDED GENDERS
          </h3>
          <div className="mt-4">
            <Chips
              items={genders}
              value={form.preferences.excludedGenders}
              onChange={(excludedGenders) => prefs({ excludedGenders })}
            />
          </div>
          <h3 className="mt-8 font-black uppercase text-slate-500">
            EXCLUDED AGE RANGES
          </h3>
          <div className="mt-4">
            <Chips
              items={ages}
              value={form.preferences.excludedAgeRanges}
              onChange={(excludedAgeRanges) => prefs({ excludedAgeRanges })}
            />
          </div>
          <h3 className="mt-8 font-black uppercase text-slate-500">
            EXCLUDED HAIR COLORS
          </h3>
          <div className="mt-4">
            <Chips
              items={hairs}
              value={form.preferences.excludedHairColors}
              onChange={(excludedHairColors) => prefs({ excludedHairColors })}
            />
          </div>
          <h3 className="mt-8 font-black uppercase text-slate-500">
            MAXIMUM DISTANCE
          </h3>
          <div className="mt-4 flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="200"
              value={form.preferences.maxDistance}
              onChange={(e) => prefs({ maxDistance: Number(e.target.value) })}
              className="w-full accent-rose-500"
            />
            <span className="rounded-2xl border-2 border-slate-900 bg-rose-50 px-3 py-2 font-black text-rose-500">
              {form.preferences.maxDistance} km
            </span>
          </div>
          <h3 className="mt-8 font-black uppercase text-slate-500">
            EXCLUDED HABITS
          </h3>
          <div className="mt-4">
            <Chips
              items={habits}
              value={form.preferences.excludedHabits}
              onChange={(excludedHabits) => prefs({ excludedHabits })}
            />
          </div>
          <div className="mt-6">
            <Toggle
              label="Exclude people with glasses"
              value={form.preferences.excludeGlasses}
              onChange={(excludeGlasses) => prefs({ excludeGlasses })}
            />
            <Toggle
              label="Exclude tattoos"
              value={form.preferences.excludeTattoos}
              onChange={(excludeTattoos) => prefs({ excludeTattoos })}
            />
            <Toggle
              label="Exclude piercings"
              value={form.preferences.excludePiercings}
              onChange={(excludePiercings) => prefs({ excludePiercings })}
            />
          </div>
          <div className="mt-8 rounded-3xl border-2 border-slate-900 bg-amber-50 p-5">
            <Toggle
              label="STRICT MODE"
              value={form.preferences.strictMode}
              onChange={(strictMode) => prefs({ strictMode })}
            />
            <p className="mt-2 text-slate-500">
              Profiles with Red Flags will not appear at all.
            </p>
          </div>
        </section>
        <section className="rounded-3xl border-2 border-rose-200 bg-rose-50 p-5">
          <h3 className="text-xl font-black text-rose-600">DANGER ZONE</h3>
          <p className="mt-2 text-slate-600">
            Permanently delete your account and all its data.
          </p>
          <button
            type="button"
            onClick={() => void deleteAccount()}
            className="mt-4 rounded-2xl bg-rose-600 px-5 py-3 font-black text-white"
          >
            DELETE MY ACCOUNT
          </button>
        </section>
        {error && (
          <p
            role="alert"
            className="rounded-2xl bg-rose-100 p-4 font-semibold text-rose-700"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="rounded-2xl bg-emerald-100 p-4 font-semibold text-emerald-700"
          >
            {notice}
          </p>
        )}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-rose-200 bg-white/95 p-4">
        <button
          disabled={saving || uploading}
          className="mx-auto block w-full max-w-2xl rounded-2xl bg-rose-500 px-5 py-4 text-lg font-black text-white shadow-[0_6px_0_#b91c3a] disabled:opacity-50"
        >
          {saving ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </div>
    </form>
  );
}
