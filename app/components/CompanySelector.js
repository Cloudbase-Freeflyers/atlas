"use client";

import * as React from "react";
import { useFilters } from "../lib/FiltersContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { useMyCompanies } from "@/hooks/useUsers";

export default function CompanySelector() {
  const { data: companies, isLoading } = useMyCompanies();
  const { companyId, setCompanyId } = useFilters();
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!companyId && companies && companies.length > 0) {
      setCompanyId(companies[0].id);
    }
  }, [companyId, companies, setCompanyId]);

  const filteredCompanies = React.useMemo(() => {
    if (!companies) return [];
    if (!search) return companies;
    return companies.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [companies, search]);

  const selectedCompany = companies && companies.find((c) => c.id === companyId);

  return (
    <div className="tw:flex tw:items-center">
      <Select
        value={companyId || ""}
        onValueChange={(val) => {
          setCompanyId(val);
          setSearch("");
        }}
      >
        <SelectTrigger className="tw:min-w-[180px] tw:h-9 tw:bg-white/10 tw:border-white/20 tw:text-white">
          <SelectValue placeholder="Select company...">
            {selectedCompany?.name || "Select company..."}
          </SelectValue>
        </SelectTrigger>
        <SelectContent 
          className="tw:bg-zinc-900 tw:border-zinc-800 tw:min-w-[200px]"
          position="popper"
          sideOffset={4}
        >
          <div className="tw:p-2 tw:sticky tw:top-0 tw:bg-zinc-900 tw:z-10">
            <Input
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="tw:h-8 tw:bg-white/5 tw:border-white/10 tw:text-white tw:placeholder:text-zinc-500"
              autoFocus
            />
          </div>
          <div className="tw:max-h-[300px] tw:overflow-y-auto">
            {filteredCompanies.map((company) => (
              <SelectItem 
                key={company.id} 
                value={company.id}
                className="tw:text-white tw:focus:bg-white/10"
              >
                {company.name}
              </SelectItem>
            ))}
            {filteredCompanies.length === 0 && (
              <div className="tw:p-4 tw:text-center tw:text-zinc-500 tw:text-sm">
                No companies found
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
