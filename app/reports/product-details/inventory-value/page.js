"use client";

import DataTable from "../../../components/DataTable";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";



const columns = [
  { key: "sku", label: "SKU" },
  { key: "onHand", label: "On hand" },
  { key: "value", label: "Inventory value" },
  { key: "turns", label: "Turns" },
  { key: "age", label: "Age" },
];

export default function InventoryValuePage() {
  return (
    <div className="grid" style={{ gap: 20 }}>

      <ReportsConnectMessage
        title="Inventory value unavailable"
        description="Connect the Amazon Seller Central (SP-API) to see live inventory value and turns data here."
      />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
