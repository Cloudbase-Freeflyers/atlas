"use client";

import LineChart from "../../../components/LineChart";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";



export default function UnitSalesTrendPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>

      <ReportsConnectMessage
        title="Unit sales trend unavailable"
        description="Connect the Amazon Seller Central (SP-API) and inventory APIs to see live unit sales trend data here."
      />
      <LineChart title="Unit sales trend" />
    </div>
  );
}
