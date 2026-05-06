"use client";

import LineChart from "../../../components/LineChart";
import {useData} from "@/hooks/useData.js";




export default function PPCPage() {
   const {data,isLoading} = useData({
       "measures": [
           "PnlDistribution.adCost",
           "PnlDistribution.totalSales"
       ],
       "dimensions": [
           "PnlDistribution.report_date"
       ],
       "order": {
           "PnlDistribution.report_date": "asc"
       }
   },data=>data.map((item) => ({
       date: new Date(item['PnlDistribution.report_date']).toLocaleDateString(),
       cost:item['PnlDistribution.adCost'],
       sales:item['PnlDistribution.totalSales']
   })),"ppcsalesspedn","PnlDistribution.report_date")
    if (isLoading) {
        return (
            <div className="grid" style={{ gap: 20 }}>

                <div className="card"><div className="card-inner"><p className="reports-loading">Loading…</p></div></div>
            </div>
        );
    }
    return (
    <div className="grid" style={{ gap: 20 }}>

        <LineChart title="PPC Spend vs Sales" xKey={'date'} data={data} config={{
            cost:{
                key:'cost',
                label: "PPC Spend",
                color: "#98f06c",
                formatter: "currency",
            },
            sales:{
                key:'sales',
                label: "Sales",
                color: "#f0e96c",
                formatter: "currency",
            },
        }} />
    </div>
  );
}
