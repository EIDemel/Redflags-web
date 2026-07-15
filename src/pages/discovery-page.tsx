import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProfileCard } from "../components/profile-card";
import { useApi } from "../hooks/use-api";
import { api } from "../services/api";
import type { Profile } from "../types/api";
export function DiscoveryPage() {
  const [email] = useState(() => localStorage.getItem("redflags.userEmail")),
    [profiles, setProfiles] = useState<Profile[]>([]),
    profilesApi = useApi(api.getProfiles),
    swipeApi = useApi(api.swipe);
  const load = useCallback(async () => {
    if (!email) return;
    try {
      const pos = await new Promise<GeolocationPosition | null>((resolve) =>
        navigator.geolocation
          ? navigator.geolocation.getCurrentPosition(
              resolve,
              () => resolve(null),
              { timeout: 5000 },
            )
          : resolve(null),
      );
      setProfiles(
        await profilesApi.execute({
          email,
          limit: 10,
          latitude: pos?.coords.latitude,
          longitude: pos?.coords.longitude,
        }),
      );
    } catch {}
  }, [email, profilesApi]);
  useEffect(() => {
    void load();
  }, [load]);
  async function swipe(action: "like" | "dislike") {
    const p = profiles[0];
    if (!email || !p) return;
    try {
      const r = await swipeApi.execute(email, p.id, action);
      setProfiles((x) => x.slice(1));
      if (r.isMatch) window.alert("Match with " + p.name);
    } catch {}
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
  return (
    <section className="mx-auto max-w-md">
      <div className="mb-6 flex justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
            Discover
          </p>
          <h1 className="text-3xl font-black">Nearby profiles</h1>
        </div>
        <button onClick={() => void load()} className="text-slate-400">
          Refresh
        </button>
      </div>
      {profilesApi.error && (
        <p className="mb-4 text-rose-300">
          {profilesApi.error}. Location is required by the backend.
        </p>
      )}
      {swipeApi.error && <p className="mb-4 text-rose-300">{swipeApi.error}</p>}
      {profilesApi.isLoading ? (
        <p>Loading...</p>
      ) : profiles[0] ? (
        <ProfileCard
          profile={profiles[0]}
          onSwipe={(a) => void swipe(a)}
          loading={swipeApi.isLoading}
        />
      ) : (
        <p className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-slate-400">
          No profile available.
        </p>
      )}
    </section>
  );
}
