import { Link, useLocation, useNavigate } from "react-router-dom";
import type { User } from "../types";

interface Props {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ user, onLogout, children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-surface">
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center h-14">
          <div className="flex items-center gap-8">
            <span className="font-serif text-xl text-text-primary italic tracking-tight">
              claudebot
            </span>
            <div className="flex gap-6">
              <Link
                to="/"
                className={`text-xs tracking-wide uppercase transition-colors ${
                  isActive("/")
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                Dashboard
              </Link>
              {user.is_superuser && (
                <Link
                  to="/users"
                  className={`text-xs tracking-wide uppercase transition-colors ${
                    isActive("/users")
                      ? "text-text-primary"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Users
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-xs text-text-muted">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-text-muted hover:text-accent transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
