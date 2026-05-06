"use client";

import DataTable from "../../../components/DataTable";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";



const columns = [
  { key: "sku", label: "SKU" },
  { key: "material", label: "Material cost" },
  { key: "labor", label: "Labor cost" },
  { key: "overhead", label: "Overhead" },
  { key: "total", label: "Total COGS" },
];

export default function CustomCogsPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>

      <ReportsConnectMessage
        title="Custom COGS unavailable"
        description="Connect the Amazon Seller Central (SP-API) to view and edit custom COGS data here."
      />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
