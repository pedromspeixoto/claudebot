import type { User } from "../types";

interface Props {
  user: User;
}

export default function Dashboard({ user }: Props) {
  return (
    <div>
      <h1 className="font-serif text-3xl italic text-text-primary mb-8 tracking-tight">
        Dashboard
      </h1>

      <section className="border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xs text-text-muted uppercase tracking-widest mb-5">
          Profile
        </h2>
        <div className="grid grid-cols-2 gap-y-4 gap-x-12">
          <div>
            <dt className="text-xs text-text-muted mb-0.5">Email</dt>
            <dd className="text-sm text-text-primary">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted mb-0.5">Name</dt>
            <dd className="text-sm text-text-primary">
              {user.full_name || "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted mb-0.5">Role</dt>
            <dd className="text-sm text-text-primary">
              {user.is_superuser ? "Superuser" : "User"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted mb-0.5">Status</dt>
            <dd className="text-sm">
              <span
                className={
                  user.is_active ? "text-success" : "text-danger"
                }
              >
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </dd>
          </div>
        </div>
      </section>
    </div>
  );
}
