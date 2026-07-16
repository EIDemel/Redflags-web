import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TinderCard } from "../components/tinder-card";
import { useApi } from "../hooks/use-api";
import { api } from "../services/api";
import type { Profile } from "../types/api";

export function TinderDiscoveryPage() {
  const [email] = useState(() => localStorage.getItem("redflags.userEmail")),
    [profiles, setProfiles] = useState<Profile[]>([]),
    [match, setMatch] = useState<string | null>(null);
  const profilesApi = useApi(api.getProfiles),
    swipeApi = useApi(api.swipe);
  const { execute: loadProfiles } = profilesApi;
  const load = useCallback(async () => {
    if (!email) return;
    try {
      const pos = await new Promise<GeolocationPosition | null>((resolve) =>
        navigator.geolocation
          ? navigator.geolocation.getCurrentPosition(
              resolve,
              () => resolve(null),
              { enableHighAccuracy: true, timeout: 7000 },
            )
          : resolve(null),
      );
      const query = {
        email,
        limit: 20,
        latitude: pos?.coords.latitude,
        longitude: pos?.coords.longitude,
      };
      const result = await loadProfiles(query);

      if (result.length > 0 || !pos) {
        setProfiles(result);
        return;
      }

      const expandedResult = await loadProfiles({
        ...query,
        maxDistance: 20_000,
      });
      setProfiles(expandedResult);
    } catch {}
  }, [email, loadProfiles]);
  useEffect(() => {
    void load();
  }, [load]);
  async function swipe(action: "like" | "dislike") {
    const current = profiles[0];
    if (!email || !current) return;
    const result = await swipeApi.execute(email, current.id, action);
    setProfiles((items) => items.slice(1));
    if (result.isMatch) setMatch("Its a match with " + current.name + "!");
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
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
            Discover
          </p>
          <h1 className="text-3xl font-black">Find your match</h1>
        </div>
        <button onClick={() => void load()} className="text-sm text-slate-400">
          Refresh
        </button>
      </div>
      {match && (
        <div
          role="status"
          className="mb-4 rounded-2xl bg-emerald-500/20 p-4 text-center text-emerald-100"
        >
          {match}
          <button onClick={() => setMatch(null)} className="ml-3 underline">
            Close
          </button>
        </div>
      )}
      {profilesApi.error && (
        <p role="alert" className="mb-4 text-rose-300">
          {profilesApi.error}. Allow location access to retrieve profiles.
        </p>
      )}
      {swipeApi.error && (
        <p role="alert" className="mb-4 text-rose-300">
          {swipeApi.error}
        </p>
      )}
      {profilesApi.isLoading ? (
        <p className="text-center text-slate-400">Loading profiles...</p>
      ) : profiles[0] ? (
        <TinderCard
          profile={profiles[0]}
          onSwipe={swipe}
          busy={swipeApi.isLoading}
        />
      ) : (
        <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-slate-400">
          <p>No profile available.</p>
          <button
            onClick={() => void load()}
            className="mt-4 text-rose-400 underline"
          >
            Try again
          </button>
        </div>
      )}
    </section>
  );
}
