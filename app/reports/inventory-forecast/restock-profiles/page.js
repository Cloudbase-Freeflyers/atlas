"use client";

import DataTable from "../../../components/DataTable";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";



const columns = [
  { key: "profile", label: "Profile" },
  { key: "skus", label: "SKUs" },
  { key: "target", label: "Target cover" },
  { key: "frequency", label: "Review cadence" },
  { key: "next", label: "Next restock" },
];

export default function RestockProfilesPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>

      <ReportsConnectMessage
        title="Restock profiles unavailable"
        description="Connect the Amazon Seller Central (SP-API) and inventory APIs to see and manage restock profiles here."
      />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
