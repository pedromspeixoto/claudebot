import { Navigate } from "react-router-dom";
import type { User } from "../types";

interface Props {
  user: User | null;
  loading: boolean;
  children: React.ReactNode;
}

export default function PrivateRoute({ user, loading, children }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <span className="text-text-muted text-xs tracking-widest uppercase animate-pulse">
          Loading
        </span>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
