import { type FormEvent, useEffect, useState } from "react";
import apiClient from "../api/client";
import type { User, UsersPublic } from "../types";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    const res = await apiClient.get<UsersPublic>("/users/");
    setUsers(res.data.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await apiClient.post("/users/", {
        email,
        password,
        full_name: fullName || undefined,
      });
      setEmail("");
      setPassword("");
      setFullName("");
      setShowForm(false);
      await fetchUsers();
    } catch {
      setError("Failed to create user. Email may already exist.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl italic text-text-primary tracking-tight">
          Users
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs border border-border text-text-secondary hover:text-text-primary hover:border-text-muted px-4 py-2 rounded transition-colors cursor-pointer"
        >
          {showForm ? "Cancel" : "New User"}
        </button>
      </div>

      {showForm && (
        <div className="border border-border rounded-lg p-6 mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <div className="text-xs text-danger border border-danger/20 bg-danger/5 px-3 py-2 rounded">
                {error}
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface-raised border border-border text-text-primary text-xs px-3 py-2.5 rounded outline-none focus:border-accent transition-colors placeholder:text-text-muted"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-surface-raised border border-border text-text-primary text-xs px-3 py-2.5 rounded outline-none focus:border-accent transition-colors placeholder:text-text-muted"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-surface-raised border border-border text-text-primary text-xs px-3 py-2.5 rounded outline-none focus:border-accent transition-colors placeholder:text-text-muted"
              />
            </div>
            <button
              type="submit"
              className="text-xs bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded transition-colors cursor-pointer"
            >
              Create User
            </button>
          </form>
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs text-text-muted font-normal uppercase tracking-widest">
                Email
              </th>
              <th className="px-5 py-3 text-left text-xs text-text-muted font-normal uppercase tracking-widest">
                Name
              </th>
              <th className="px-5 py-3 text-left text-xs text-text-muted font-normal uppercase tracking-widest">
                Role
              </th>
              <th className="px-5 py-3 text-left text-xs text-text-muted font-normal uppercase tracking-widest">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-border-subtle last:border-0 hover:bg-surface-hover transition-colors"
              >
                <td className="px-5 py-3.5 text-xs text-text-primary">
                  {u.email}
                </td>
                <td className="px-5 py-3.5 text-xs text-text-secondary">
                  {u.full_name || "\u2014"}
                </td>
                <td className="px-5 py-3.5 text-xs text-text-secondary">
                  {u.is_superuser ? "Superuser" : "User"}
                </td>
                <td className="px-5 py-3.5 text-xs">
                  <span className={u.is_active ? "text-success" : "text-danger"}>
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
