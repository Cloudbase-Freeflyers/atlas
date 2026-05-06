"use client";

import DataTable from "../../../components/DataTable";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";



const columns = [
  { key: "sku", label: "SKU" },
  { key: "length", label: "Length" },
  { key: "width", label: "Width" },
  { key: "height", label: "Height" },
  { key: "weight", label: "Weight" },
  { key: "carton", label: "Carton qty" },
];

export default function PackageCartonPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>

      <ReportsConnectMessage
        title="Package & carton data unavailable"
        description="Connect the Amazon Seller Central (SP-API) to see live package and carton dimensions here."
      />
      <div className="card">
        <div className="card-inner">
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
