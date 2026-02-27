"use client";

import * as React from "react";
import { useFilters } from "../lib/FiltersContext";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "./ui/combobox";
import {useData} from "@/hooks/useData.js";



export default function CompanySelector() {
  const {data:companies,isLoading} = useData({
    "dimensions": [
      "Companies.name",
      "Companies.id"
    ]
  },(data)=>data.map(item=>({
    name:item['Companies.name'],
    id:item['Companies.id']
  })),"companies")
  const { companyId, setCompanyId } = useFilters();
  const [search, setSearch] = React.useState("");

  const filteredCompanies = search === ""
    ? companies
    : companies.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );

  const selectedCompany = companies && companies.find((c) => c.id === companyId);

  return (
    <div>
      <Combobox
        value={companyId}
        onValueChange={(val) => setCompanyId(val)}
      >
        <ComboboxInput
          placeholder="Select company..."
          onChange={(e) => setSearch(e.target.value)}
          value={search || selectedCompany?.name || ""}
          className="tw:min-w-[180px] tw:h-9 tw:bg-white/10 tw:border-white/20 tw:text-white"
        />
        <ComboboxContent>
          <ComboboxList>
            {filteredCompanies && filteredCompanies.map((company) => (
              <ComboboxItem key={company.id} value={company.id}>
                {company.name}
              </ComboboxItem>
            ))}
            {filteredCompanies && filteredCompanies.length === 0 && (
              <ComboboxEmpty>No company found.</ComboboxEmpty>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
