"use client";

import DataTable from "../../../components/DataTable";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";



const columns = [
  { key: "task", label: "Task" },
  { key: "scope", label: "Scope" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Last updated" },
];

export default function BulkOperationsPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>

      <ReportsConnectMessage
        title="Bulk operations unavailable"
        description="Connect the Amazon Seller Central (SP-API) to run and monitor bulk operations here."
      />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
