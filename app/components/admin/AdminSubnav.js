"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview", match: (p) => p === "/admin" },
  { href: "/admin/users", label: "Users", match: (p) => p.startsWith("/admin/users") },
  { href: "/admin/clients", label: "Clients", match: (p) => p.startsWith("/admin/clients") },
];

export default function AdminSubnav() {
  const pathname = usePathname();

  return (
    <div className="tw:border-b tw:border-white/10 tw:bg-black/40">
      <div className="tw:container tw:mx-auto tw:max-w-6xl tw:px-4 tw:py-3 tw:flex tw:flex-wrap tw:gap-6 tw:text-sm tw:font-medium">
        {links.map(({ href, label, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? "tw:text-white tw:border-b-2 tw:border-emerald-500 tw:-mb-3 tw:pb-3"
                  : "tw:text-zinc-500 hover:tw:text-zinc-200"
              }
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
