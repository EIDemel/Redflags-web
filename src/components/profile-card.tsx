import type { Profile } from "../types/api";
export function ProfileCard({
  profile,
  onSwipe,
  loading,
}: {
  profile: Profile;
  onSwipe?: (a: "like" | "dislike") => void;
  loading?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
      <img
        className="h-72 w-full object-cover"
        src={profile.images[0] ?? profile.avatarUrl}
        alt={"Profile " + profile.name}
      />
      <div className="space-y-4 p-6">
        <div>
          <h2 className="text-2xl font-bold">
            {profile.name}, {profile.age}
          </h2>
          <p className="text-sm text-slate-400">
            {profile.distance?.toFixed(1) ?? "-"} km - {profile.hairColor}
          </p>
        </div>
        <p className="text-slate-300">{profile.bio}</p>
        <div className="flex flex-wrap gap-2">
          {profile.habits.map((x) => (
            <span
              key={x}
              className="rounded-full bg-white/10 px-3 py-1 text-xs"
            >
              {x.replaceAll("_", " ")}
            </span>
          ))}
        </div>
        {onSwipe && (
          <div className="flex gap-3">
            <button
              disabled={loading}
              onClick={() => onSwipe("dislike")}
              className="flex-1 rounded-xl border border-white/15 p-3"
            >
              Pass
            </button>
            <button
              disabled={loading}
              onClick={() => onSwipe("like")}
              className="flex-1 rounded-xl bg-rose-500 p-3 font-bold"
            >
              Like
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
