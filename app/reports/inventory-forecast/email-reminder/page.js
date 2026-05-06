"use client";

import DataTable from "../../../components/DataTable";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";



const columns = [
  { key: "rule", label: "Rule" },
  { key: "skus", label: "SKUs" },
  { key: "threshold", label: "Threshold" },
  { key: "recipients", label: "Recipients" },
  { key: "status", label: "Status" },
];

export default function EmailReminderPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>

      <ReportsConnectMessage
        title="Email reminder rules unavailable"
        description="Connect the Amazon Seller Central (SP-API) and inventory APIs to configure and view restock email reminders here."
      />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
