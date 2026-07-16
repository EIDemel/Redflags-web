import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authSession } from "../services/auth-session";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation(),
    [ready, setReady] = useState(false);
  useEffect(() => {
    void authSession.refreshIfAvailable().finally(() => setReady(true));
  }, []);
  if (!ready)
    return <p className="text-center text-slate-400">Checking session...</p>;
  return authSession.isAuthenticated() ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const location = useLocation(),
    [ready, setReady] = useState(false);
  useEffect(() => {
    void authSession.refreshIfAvailable().finally(() => setReady(true));
  }, []);
  if (!ready)
    return <p className="text-center text-slate-400">Checking session...</p>;
  if (!authSession.isAuthenticated())
    return <Navigate to="/" replace state={{ from: location }} />;
  return authSession.isAdmin() ? (
    <>{children}</>
  ) : (
    <Navigate to="/discover" replace />
  );
}
