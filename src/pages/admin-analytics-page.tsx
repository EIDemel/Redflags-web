import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useApi } from "../hooks/use-api";
import { api } from "../services/api";
import { authSession } from "../services/auth-session";

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
                {label}
            </p>
            <p className="mt-2 text-3xl font-black">{value}</p>
        </div>
    );
}

export function AdminAnalyticsPage() {
    const email = authSession.getEmail(),
        analyticsApi = useApi(api.getAdminAnalytics),
        matchesApi = useApi(api.getAdminMatches),
        redFlagsApi = useApi(api.getRedFlags),
        createRedFlagApi = useApi(api.createRedFlag);

    const [newRedFlagLabel, setNewRedFlagLabel] = useState(""),
        [redFlagFeedback, setRedFlagFeedback] = useState<string | null>(null);

    const load = useCallback(() => {
        if (!email) return;
        void analyticsApi.execute(email);
        void matchesApi.execute(email);
        void redFlagsApi.execute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    useEffect(() => {
        load();
    }, [load]);

    const analytics = analyticsApi.data,
        matches = matchesApi.data ?? [],
        redFlags = redFlagsApi.data ?? [],
        error = analyticsApi.error ?? matchesApi.error,
        loading = analyticsApi.isLoading || matchesApi.isLoading;

    const handleCreateRedFlag = useCallback(
        async (event: FormEvent) => {
            event.preventDefault();
            setRedFlagFeedback(null);
            const label = newRedFlagLabel.trim();
            if (!label) return;
            try {
                await createRedFlagApi.execute(label);
                setNewRedFlagLabel("");
                setRedFlagFeedback(`"${label}" added to the catalogue.`);
                void redFlagsApi.execute();
            } catch {
                // error is already exposed via createRedFlagApi.error
            }
        },
        [newRedFlagLabel, createRedFlagApi, redFlagsApi],
    );

    if (!email)
        return <p className="text-center text-slate-400">Sign in first.</p>;

    return (
        <section>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
                        Admin
                    </p>
                    <h1 className="text-3xl font-black">Analytics dashboard</h1>
                </div>
                <button
                    type="button"
                    onClick={load}
                    disabled={loading}
                    className="text-slate-400"
                >
                    Refresh
                </button>
            </div>


            {error && <p className="mb-4 text-rose-300">{error}</p>}

            {analyticsApi.isLoading && !analytics ? (
                <p className="text-slate-400">Loading analytics...</p>
            ) : analytics ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total users" value={analytics.totalUsers} />
                    <StatCard label="Total matches" value={analytics.totalMatches} />
                    <StatCard label="Total swipes" value={analytics.totalSwipes} />
                    <StatCard
                        label="Match rate"
                        value={(analytics.matchRate * 100).toFixed(1) + "%"}
                    />
                    <StatCard label="Total messages" value={analytics.totalMessages} />
                    <StatCard label="Total reports" value={analytics.totalReports} />
                    <StatCard
                        label="New users (7d)"
                        value={analytics.newUsersLast7Days}
                    />
                    <StatCard
                        label="Active users (7d)"
                        value={analytics.activeUsersLast7Days}
                    />
                </div>
            ) : null}

            <div className="mt-10">
                <h2 className="text-xl font-black">Who matched with whom</h2>
                {matchesApi.isLoading && !matchesApi.data ? (
                    <p className="mt-4 text-slate-400">Loading matches...</p>
                ) : matches.length ? (
                    <div className="mt-4 overflow-x-auto rounded-3xl border border-white/10">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-slate-400">
                                <tr>
                                    <th className="p-4">User A</th>
                                    <th className="p-4">User B</th>
                                    <th className="p-4">Matched at</th>
                                    <th className="p-4">Messages</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map((match) => (
                                    <tr key={match.id} className="border-t border-white/10">
                                        <td className="p-4">
                                            {match.userA.name}
                                            <span className="block text-xs text-slate-500">
                                                {match.userA.email}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {match.userB.name}
                                            <span className="block text-xs text-slate-500">
                                                {match.userB.email}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {new Date(match.matchedAt).toLocaleString()}
                                        </td>
                                        <td className="p-4">{match.messageCount ?? "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mt-4 rounded-3xl border border-dashed border-white/15 p-10 text-center text-slate-400">
                        No matches yet.
                    </p>
                )}
            </div>

            <div className="mt-10">
                <h2 className="text-xl font-black">Red flags catalogue</h2>
                <p className="mt-1 text-sm text-slate-400">
                    Add new red flags so users can pick them on their profile.
                </p>

                <form
                    onSubmit={handleCreateRedFlag}
                    className="mt-4 flex flex-col gap-3 sm:flex-row"
                >
                    <input
                        type="text"
                        value={newRedFlagLabel}
                        onChange={(e) => setNewRedFlagLabel(e.target.value)}
                        placeholder="e.g. Leaves you on read"
                        maxLength={80}
                        className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={createRedFlagApi.isLoading || !newRedFlagLabel.trim()}
                        className="rounded-2xl bg-rose-500 px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                    >
                        {createRedFlagApi.isLoading ? "Adding..." : "Add red flag"}
                    </button>
                </form>

                {createRedFlagApi.error && (
                    <p className="mt-3 text-rose-300">{createRedFlagApi.error}</p>
                )}
                {!createRedFlagApi.error && redFlagFeedback && (
                    <p className="mt-3 text-emerald-400">{redFlagFeedback}</p>
                )}

                {redFlagsApi.isLoading && !redFlagsApi.data ? (
                    <p className="mt-4 text-slate-400">Loading catalogue...</p>
                ) : redFlagsApi.error ? (
                    <p className="mt-4 text-rose-300">{redFlagsApi.error}</p>
                ) : redFlags.length ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                        {redFlags.map((flag) => (
                            <span
                                key={flag.id}
                                className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm font-bold"
                            >
                                {flag.label}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="mt-4 rounded-3xl border border-dashed border-white/15 p-10 text-center text-slate-400">
                        No red flags yet.
                    </p>
                )}
            </div>
        </section>
    );
}
