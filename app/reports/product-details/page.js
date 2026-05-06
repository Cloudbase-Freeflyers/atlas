
import DataTable from "../../components/DataTable";
import ReportsConnectMessage from "../../components/ReportsConnectMessage";



const columns = [
  { key: "status", label: "Status" },
  { key: "product", label: "Product" },
  { key: "price", label: "Price" },
  { key: "asin", label: "ASIN" },
  { key: "sku", label: "Preferred SKU" },
  { key: "shortName", label: "Short name" },
  { key: "cost", label: "Production cost" },
  { key: "freight", label: "Freight cost" },
  { key: "lead", label: "Production lead time" },
  { key: "note", label: "Note" },
];

export default function ProductDetailsPage() {
  return (
    <div className="grid" style={{ gap: 20 }}>

      <ReportsConnectMessage
        title="Product details unavailable"
        description="Connect the Amazon Seller Central (SP-API) to see live product details, pricing, and ASIN data here."
      />
      <div className="card">
        <div className="card-inner">
          <div className="filter-row">
            <input className="input" placeholder="Instant search" />
            <button className="button">Download as CSV</button>
          </div>
          <DataTable columns={columns} rows={[]} />
        </div>
      </div>
    </div>
  );
}
