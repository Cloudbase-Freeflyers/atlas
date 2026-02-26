"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFilters } from "../lib/FiltersContext";
import CompanySelector from "./CompanySelector";
import DateRangePicker from "./DateRangePicker";
import {Button} from "../components/ui/button.jsx";

export default function TopBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { companyId, setCompanyId } = useFilters();
  const [copied, setCopied] = useState(false);
  const paramsString = searchParams.toString();

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(paramsString);
    params.set("account", companyId);
    return `${window.location.origin}${pathname}?${params.toString()}`;
  }, [companyId, pathname, paramsString]);

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
    <header className="topbar tw:pb-4 tw:pt-2">
      <div className="topbar-inner">
        <div className="tw:flex">
          <CompanySelector />
          <div className="tw:flex-1"></div>
          <DateRangePicker />
          <Button >
            Reset
          </Button>
          <Button onClick={handleShare}>
            {copied ? "Link Copied" : "Share"}
          </Button>
        </div>
      </div>
    </header>
  );
}
