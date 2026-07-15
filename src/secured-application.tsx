import { Link, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/protected-route";
import { AuthLoginPage } from "./pages/auth-login-page";
import { DiscoveryPage } from "./pages/discovery-page";

function Shell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10">
        <nav className="mx-auto flex max-w-6xl justify-between p-5">
          <Link to="/" className="font-black text-rose-400">
            redflags.
          </Link>
          <Link
            to="/discover"
            className={
              location.pathname === "/discover"
                ? "text-rose-400"
                : "text-slate-400"
            }
          >
            Discover
          </Link>
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
        <Route path="/" element={<AuthLoginPage />} />
        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <DiscoveryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <DiscoveryPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Shell>
  );
}
