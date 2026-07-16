import { Link, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/protected-route";
import { AuthLoginPage } from "./pages/auth-login-page";
import { TinderDiscoveryPage as DiscoveryPage } from "./pages/tinder-discovery-page";
import { ModernProfilePage as ProfilePage } from "./pages/modern-profile-page";
import { LanguageSwitcher } from "./components/language-switcher";
import { authSession } from "./services/auth-session";
import { useLanguage } from "./i18n";
import { RegisterPage } from "./pages/register-page";

function Shell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { t } = useLanguage();
  const connected = authSession.isAuthenticated();
  const links = connected
    ? [
        ["/discover", "Discover"],
        ["/profile", "My profile"],
      ]
    : [["/register", "Register"]];
  function disconnect() {
    authSession.clear();
    window.location.assign(import.meta.env.BASE_URL);
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10">
        <nav className="mx-auto flex max-w-6xl justify-between p-5">
          <Link to="/" className="font-black text-rose-400">
            redflags.
          </Link>
          <div className="flex items-center gap-4">
            {links.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className={
                  location.pathname === to ? "text-rose-400" : "text-slate-400"
                }
              >
                {t(label)}
              </Link>
            ))}
            {connected && (
              <button
                type="button"
                onClick={disconnect}
                className="rounded-full border-2 border-rose-500 px-3 py-1 text-sm font-black text-rose-500"
              >
                {t("Disconnect")}
              </button>
            )}
            <LanguageSwitcher />
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
        <Route path="/" element={<AuthLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <DiscoveryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
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
