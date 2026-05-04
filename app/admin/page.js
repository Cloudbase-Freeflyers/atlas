import Link from "next/link";

export default function AdminHubPage() {
  return (
    <div className="tw:container tw:mx-auto tw:max-w-6xl tw:px-4 tw:py-10 tw:space-y-8">
      <div>
        <h1 className="tw:text-2xl tw:font-bold tw:text-white">Admin</h1>
        <p className="tw:text-zinc-500 tw:text-sm tw:mt-1">
          Internal tools for user access and client account records.
        </p>
      </div>
      <div className="tw:grid tw:gap-4 sm:tw:grid-cols-2">
        <Link
          href="/admin/users"
          className="tw:block tw:rounded-xl tw:border tw:border-white/10 tw:bg-white/5 tw:p-6 hover:tw:border-emerald-500/40 tw:transition-colors"
        >
          <h2 className="tw:text-lg tw:font-semibold tw:text-white">User management</h2>
          <p className="tw:text-sm tw:text-zinc-500 tw:mt-2">
            Create users, roles, and company assignments.
          </p>
        </Link>
        <Link
          href="/admin/clients"
          className="tw:block tw:rounded-xl tw:border tw:border-white/10 tw:bg-white/5 tw:p-6 hover:tw:border-emerald-500/40 tw:transition-colors"
        >
          <h2 className="tw:text-lg tw:font-semibold tw:text-white">Client accounts</h2>
          <p className="tw:text-sm tw:text-zinc-500 tw:mt-2">
            Strategy, budgets, targets, manifests, and contacts.
          </p>
        </Link>
      </div>
    </div>
  );
}
