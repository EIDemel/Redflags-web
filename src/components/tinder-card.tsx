import { useRef, useState, type PointerEvent } from "react";
import type { Profile } from "../types/api";

const apiBase = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
const photo = (url: string) => (url.startsWith("http") ? url : apiBase + url);

export function TinderCard({
  profile,
  onSwipe,
  busy,
}: {
  profile: Profile;
  onSwipe: (action: "like" | "dislike") => Promise<void>;
  busy: boolean;
}) {
  const start = useRef<number | null>(null),
    [offset, setOffset] = useState(0),
    [leaving, setLeaving] = useState<"like" | "dislike" | null>(null),
    [photoIndex, setPhotoIndex] = useState(0);
  const action = async (direction: "like" | "dislike") => {
    if (busy || leaving) return;
    setLeaving(direction);
    setOffset(direction === "like" ? 650 : -650);
    await new Promise((resolve) => setTimeout(resolve, 220));
    try {
      await onSwipe(direction);
    } catch {
      setLeaving(null);
      setOffset(0);
    }
  };
  function down(event: PointerEvent) {
    if (busy || leaving) return;
    start.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent) {
    if (start.current !== null) setOffset(event.clientX - start.current);
  }
  function up() {
    if (start.current === null) return;
    const value = offset;
    start.current = null;
    if (Math.abs(value) > 110) {
      void action(value > 0 ? "like" : "dislike");
    } else setOffset(0);
  }
  const rotation = offset / 18,
    stamp = offset > 30 ? "LIKE" : offset < -30 ? "NOPE" : "";
  const images = profile.images.length ? profile.images : [profile.avatarUrl];
  return (
    <div className="relative h-[580px] touch-none">
      <article
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        style={{
          transform: "translateX(" + offset + "px) rotate(" + rotation + "deg)",
          transition: leaving
            ? "transform .22s ease-out"
            : "transform .15s ease-out",
        }}
        className="absolute inset-0 select-none overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900 shadow-2xl shadow-black/50"
      >
        <img
          draggable={false}
          src={photo(images[photoIndex])}
          alt={"Photo of " + profile.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 top-0 flex gap-1 p-3">
          {images.map((_, index) => (
            <span
              key={index}
              className={
                "h-1 flex-1 rounded " +
                (index === photoIndex ? "bg-white" : "bg-white/40")
              }
            />
          ))}
        </div>
        {stamp && (
          <span
            className={
              "absolute left-6 top-16 -rotate-12 rounded-lg border-4 px-3 py-1 text-4xl font-black " +
              (stamp === "LIKE"
                ? "border-emerald-400 text-emerald-400"
                : "border-rose-400 text-rose-400")
            }
          >
            {stamp}
          </span>
        )}
        <button
          type="button"
          aria-label="Previous photo"
          onClick={(event) => {
            event.stopPropagation();
            setPhotoIndex(
              (index) => (index - 1 + images.length) % images.length,
            );
          }}
          className="absolute left-0 top-0 h-3/4 w-1/2"
        />
        <button
          type="button"
          aria-label="Next photo"
          onClick={(event) => {
            event.stopPropagation();
            setPhotoIndex((index) => (index + 1) % images.length);
          }}
          className="absolute right-0 top-0 h-3/4 w-1/2"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent px-6 pb-7 pt-24">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-black">
              {profile.name}, {profile.age}
            </h2>
            {profile.distance !== undefined && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm">
                {profile.distance.toFixed(1)} km
              </span>
            )}
          </div>
          <p className="mt-2 text-slate-200">{profile.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.habits.map((habit) => (
              <span
                key={habit}
                className="rounded-full bg-white/15 px-3 py-1 text-xs"
              >
                {habit.replaceAll("_", " ")}
              </span>
            ))}
          </div>
        </div>
      </article>
      <div className="absolute -bottom-20 left-0 right-0 z-10 flex justify-center gap-5">
        <button
          disabled={busy}
          onClick={() => void action("dislike")}
          aria-label="Pass this profile"
          className="grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-slate-900 text-2xl text-rose-400 shadow-lg disabled:opacity-50"
        >
          X
        </button>
        <button
          disabled={busy}
          onClick={() => void action("like")}
          aria-label="Like this profile"
          className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-3xl text-white shadow-lg disabled:opacity-50"
        >
          e
        </button>
      </div>
    </div>
  );
}
