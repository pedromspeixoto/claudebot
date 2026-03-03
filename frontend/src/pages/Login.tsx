import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import type { User } from "../types";

interface Props {
  user: User | null;
  onLogin: (email: string, password: string) => Promise<void>;
}

export default function Login({ user, onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-4xl italic text-text-primary mb-1 tracking-tight">
          claudebot
        </h1>
        <p className="text-text-muted text-xs mb-10">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="text-xs text-danger border border-danger/20 bg-danger/5 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs text-text-secondary mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-raised border border-border text-text-primary text-xs px-3 py-2.5 rounded outline-none focus:border-accent transition-colors placeholder:text-text-muted"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs text-text-secondary mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-raised border border-border text-text-primary text-xs px-3 py-2.5 rounded outline-none focus:border-accent transition-colors placeholder:text-text-muted"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-white text-xs py-2.5 rounded transition-colors disabled:opacity-40 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
