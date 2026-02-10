"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const accounts = [
  { id: "ik-multi", name: "IK Multimedia" },
  { id: "northlight", name: "Northlight Labs" },
  { id: "orbit", name: "Orbit Commerce" }
];

export default function TopBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialAccount = searchParams.get("account") || accounts[0].id;
  const [account, setAccount] = useState(initialAccount);
  const [copied, setCopied] = useState(false);
  const paramsString = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams(paramsString);
    params.set("account", account);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [account, pathname, paramsString, router]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(paramsString);
    params.set("account", account);
    return `${window.location.origin}${pathname}?${params.toString()}`;
  }, [account, pathname, paramsString]);

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setCopied(false);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          MM Stats Studio
        </Link>
        <div className="topbar-actions">
          <select
            className="select"
            value={account}
            onChange={(event) => setAccount(event.target.value)}
          >
            {accounts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <button type="button" className="button ghost">
            Reset
          </button>
          <button type="button" className="button primary" onClick={handleShare}>
            {copied ? "Link Copied" : "Share"}
          </button>
        </div>
      </div>
    </header>
  );
}
