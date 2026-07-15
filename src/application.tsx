import { Link, Route, Routes, useLocation } from "react-router-dom";
import { LoginPage } from "./pages/login-page";
import { DiscoveryPage } from "./pages/discovery-page";
function Shell({ children }: { children: React.ReactNode }) {
  const l = useLocation();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10">
        <nav className="mx-auto flex max-w-6xl justify-between p-5">
          <Link to="/" className="font-black text-rose-400">
            redflags.
          </Link>
          <div className="flex gap-4">
            {[
              ["/", "Login"],
              ["/discover", "Discover"],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className={
                  l.pathname === to ? "text-rose-400" : "text-slate-400"
                }
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/discover" element={<DiscoveryPage />} />
      </Routes>
    </Shell>
  );
}
