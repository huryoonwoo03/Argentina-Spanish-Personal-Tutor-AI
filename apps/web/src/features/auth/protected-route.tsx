import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth-context";

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!session) return <Navigate to="/auth/sign-in" replace />;

  return <Outlet />;
}
