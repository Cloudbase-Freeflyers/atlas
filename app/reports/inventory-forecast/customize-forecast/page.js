"use client";

import DataTable from "../../../components/DataTable";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";



const columns = [
  { key: "sku", label: "SKU" },
  { key: "seasonality", label: "Seasonality" },
  { key: "safety", label: "Safety stock" },
  { key: "lead", label: "Lead time" },
  { key: "override", label: "Forecast override" },
];

export default function CustomizeForecastPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>

      <ReportsConnectMessage
        title="Customize forecast unavailable"
        description="Connect the Amazon Seller Central (SP-API) and inventory APIs to see live forecast settings here."
      />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
