"use client";

import LineChart from "../../../components/LineChart";
import ReportsConnectMessage from "../../../components/ReportsConnectMessage";
// import { placeholderChartSeries } from "../../../lib/sampleData";



export default function RoiPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>

      <ReportsConnectMessage
        title="ROI data unavailable"
        description="Connect the Amazon Seller Central (SP-API) to see live ROI and margin trend data here."
      />
      <LineChart title="ROI & Margin trend" />
    </div>
  );
}
